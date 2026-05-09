import { IntentOptions, IntentFrame, GoalStrategy } from "../types";
import { generateId } from "../utils/generateId";
import { IntentResolver } from "./IntentResolver";
import { TransportManager } from "./TransportManager";
import { FallbackManager } from "./FallbackManager";
import { PendingManager } from "./PendingManager";
import { SequenceManager } from "./SequenceManager";
import { DeduplicationManager } from "./DeduplicationManager";
import { AckManager } from "./AckManager";
import { IntentQueue } from "../queue/IntentQueue";
import { RetryEngine } from "../retry/RetryEngine";
import { DeliveryMode } from "../types/DeliveryMode";
import { WebSocketTransport } from "../transports/WebSocketTransport";
import { BaseTransport } from "../transports/BaseTransport";
import { OfflineStore } from "../storage/OfflineStore";
import { RoomManager } from "./RoomManager";
import { Crypto } from "../utils/Crypto";

export class IntentEngine {
  private transportManager: TransportManager;
  private fallbackManager: FallbackManager;
  private queue: IntentQueue;
  private pending: PendingManager;
  private offlineStore: OfflineStore;
  private sequenceManager: SequenceManager;
  private deduplication: DeduplicationManager;
  private ackManager: AckManager;
  private roomManager: RoomManager;
  private wsHandlerAttached = false;
  private responseHandlers: Map<string, (payload: any) => void> = new Map();

  constructor(wsUrl: string) {
    this.transportManager = new TransportManager(wsUrl);
    this.fallbackManager = new FallbackManager();
    this.queue = new IntentQueue();
    this.pending = new PendingManager();
    this.offlineStore = new OfflineStore();
    this.sequenceManager = new SequenceManager();
    this.deduplication = new DeduplicationManager();
    this.ackManager = new AckManager();
    this.roomManager = new RoomManager();
  }

  public joinRoom(roomName: string) {
    this.roomManager.join(roomName);
  }

  public leaveRoom() {
    this.roomManager.leave();
  }

  defineGoal(goal: string, strategy: GoalStrategy) {
    IntentResolver.defineGoal(goal, strategy);
  }

  async send(payload: any, options: IntentOptions): Promise<any> {
    const strategy = IntentResolver.resolve(options.goal);
    const frameId = generateId();
    let finalPayload = payload;

    if (options.encrypted && strategy.encryptionKey) {
      finalPayload = Crypto.encrypt(payload, strategy.encryptionKey);
    }

    const targetRoom = options.room || this.roomManager.getActiveRoom();

    const frame: IntentFrame = {
      id: frameId,
      goal: options.goal,
      payload: finalPayload,
      timestamp: Date.now(),
      priority: strategy.priority,
      correlationId: options.correlationId || frameId
    };

    if (targetRoom) frame.room = targetRoom;
    if (options.ttl) frame.ttl = options.ttl;
    if (options.encrypted) frame.encrypted = true;
    if (strategy.ordered) frame.sequence = this.sequenceManager.next(options.goal);

    if (frame.ttl && (Date.now() - frame.timestamp > frame.ttl)) {
      console.warn(`[IntentNet] Message ${frame.id} expired before queuing.`);
      return;
    }

    this.queue.enqueue(frame);

    const executeSend = async (): Promise<void> => {
      const next = this.queue.dequeue();
      if (!next) return;

      if (next.ttl && (Date.now() - next.timestamp > next.ttl)) {
        console.log(`[IntentNet] Dropping expired message: ${next.id}`);
        return;
      }

      const nextStrategy = IntentResolver.resolve(next.goal);

      if (nextStrategy.delivery === DeliveryMode.EXACTLY_ONCE) {
        if (this.deduplication.isDuplicate(next.id)) return;
      }

      const primaryTransport = await this.transportManager.getTransport(nextStrategy.transport);

      if (primaryTransport instanceof WebSocketTransport && !this.wsHandlerAttached) {
        this.attachWebSocketListeners(primaryTransport);
        this.wsHandlerAttached = true;
      }

      const transports: BaseTransport[] = [primaryTransport];
      if (nextStrategy.fallback) {
        for (const fType of nextStrategy.fallback) {
          transports.push(await this.transportManager.getTransport(fType));
        }
      }

      if (options.race && transports.length > 1) {
        await (Promise as any).any(transports.map(t => t.send(next)));
      } else {
        try {
          await this.fallbackManager.execute(transports, async (t) => await t.send(next));
        } catch (err) {
          this.offlineStore.save(next);
          throw err;
        }
      }

      if (primaryTransport instanceof WebSocketTransport) {
        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("ACK timeout")), 3000);
          this.pending.add(next.id, resolve, reject, timeout);
        });
      }
    };

    return strategy.retry ? RetryEngine.execute(executeSend) : executeSend();
  }

  private attachWebSocketListeners(transport: WebSocketTransport) {
    transport.onMessage(async (data) => {
      if (data.ack) {
        this.pending.resolve(data.ack);
        if (!data.goal && !data.payload) return;
      }

      let payload = data.payload;

      if (data.goal) {
        try {
          const strategy = IntentResolver.resolve(data.goal);
          if (data.encrypted && strategy.encryptionKey && typeof payload === 'string') {
            payload = Crypto.decrypt(payload, strategy.encryptionKey);
          }
        } catch (e) {
          // Ignore
        }
      }

      if (data.correlationId && this.responseHandlers.has(data.correlationId)) {
        const handler = this.responseHandlers.get(data.correlationId);
        if (handler) {
          handler(payload);
          this.responseHandlers.delete(data.correlationId);
        }
      }

      if (payload && !data.ack) {
        const fromInfo = data.from ? `from ${data.from}` : 'server';
        console.log(`[IntentNet] Data ${fromInfo} [${data.room || 'global'}]:`, payload);
      }

      if (transport.isConnected) {
        const offlineFrames = this.offlineStore.getAll();
        if (offlineFrames.length > 0) {
          for (const frame of offlineFrames) {
            if (!frame.ttl || (Date.now() - frame.timestamp < frame.ttl)) {
              await transport.send(frame);
            }
          }
          this.offlineStore.clear();
        }
      }
    });
  }
}