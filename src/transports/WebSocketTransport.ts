import WebSocket from "ws";

import { IntentFrame } from "../types";
import { BaseTransport } from "./BaseTransport";
import { ConnectionManager } from "../core/ConnectionManager";

export class WebSocketTransport extends BaseTransport {

  private ws?: WebSocket;

  private listeners:
    Array<(data: any) => void> = [];

  public isConnected = false;

  private connectionManager =
    new ConnectionManager();

  constructor(
    private url: string
  ) {
    super();
  }

  async connect(): Promise<void> {

    if (
      this.isConnected &&
      this.ws
    ) {
      return;
    }

    return new Promise(
      (resolve, reject) => {

        this.ws =
          new WebSocket(this.url);

        this.ws.on(
          "open",
          () => {

            this.isConnected =
              true;

            console.log(
              "[IntentNet] WebSocket connected"
            );

            resolve();
          }
        );

        this.ws.on(
          "message",
          (data) => {

            try {

              const parsed =
                JSON.parse(
                  data.toString()
                );

              this.listeners.forEach(
                listener =>
                  listener(parsed)
              );

            } catch (error) {

              console.log(
                "[IntentNet] Invalid message"
              );
            }
          }
        );

        this.ws.on(
          "close",
          async () => {

            console.log(
              "[IntentNet] Connection lost"
            );

            this.isConnected =
              false;

            try {

              await this.connectionManager
                .reconnect(
                  () => this.connect()
                );

            } catch {

              console.log(
                "[IntentNet] Reconnect failed"
              );
            }
          }
        );

        this.ws.on(
          "error",
          (error) => {

            console.log(
              "[IntentNet] WebSocket error",
              error
            );

            reject(error);
          }
        );
      }
    );
  }

  async send(
    frame: IntentFrame
  ): Promise<void> {

    if (
      !this.ws ||
      !this.isConnected
    ) {

      throw new Error(
        "WebSocket disconnected"
      );
    }

    this.ws.send(
      JSON.stringify(frame)
    );
  }

  async disconnect(): Promise<void> {

    if (!this.ws) {
      return;
    }

    this.ws.close();

    this.isConnected =
      false;

    console.log(
      "[IntentNet] WebSocket disconnected"
    );
  }

  onMessage(
    callback: (
      data: any
    ) => void
  ) {

    this.listeners.push(
      callback
    );
  }
}