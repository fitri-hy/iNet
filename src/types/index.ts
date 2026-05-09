import { Priority } from "./Priority";
import { DeliveryMode } from "./DeliveryMode";

export interface IntentOptions {
  goal: string;
  room?: string;
  ttl?: number;
  correlationId?: string;
  race?: boolean; 
  encrypted?: boolean;
}

export interface IntentFrame {
  id: string;
  goal: string;
  payload: any;
  timestamp: number;
  priority: number;
  sequence?: number;
  room?: string;
  ttl?: number;
  correlationId?: string;
  encrypted?: boolean;
}

export interface GoalStrategy {
  transport: "websocket" | "http";
  fallback?: string[];
  retry: boolean;
  priority: Priority;
  ordered?: boolean;
  delivery?: DeliveryMode;
  encryptionKey?: string;
}