import { BaseTransport } from "./BaseTransport";

export class HttpTransport extends BaseTransport {
  async connect(): Promise<void> {
    console.log("[IntentNet] HTTP transport ready");
  }

  async send(payload: any): Promise<void> {
    console.log("[HTTP SEND]", payload);
  }

  async disconnect(): Promise<void> {
    console.log("[IntentNet] HTTP transport closed");
  }
}