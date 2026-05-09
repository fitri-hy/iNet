export abstract class BaseTransport {
  abstract connect(): Promise<void>;

  abstract send(payload: any): Promise<void>;

  abstract disconnect(): Promise<void>;
}