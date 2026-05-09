import { BaseTransport }
from "../transports/BaseTransport";

import { WebSocketTransport }
from "../transports/WebSocketTransport";

import { HttpTransport }
from "../transports/HttpTransport";

export class TransportManager {

  private transports:
    Record<string, BaseTransport>
      = {};

  constructor(
    private wsUrl: string
  ) {}

  async getTransport(
    type: string
  ): Promise<BaseTransport> {

    if (
      this.transports[type]
    ) {

      return this.transports[type];
    }

    let transport:
      BaseTransport;

    switch (type) {

      case "websocket":

        transport =
          new WebSocketTransport(
            this.wsUrl
          );

        await transport.connect();

        break;

      case "http":

        transport =
          new HttpTransport();

        await transport.connect();

        break;

      default:

        throw new Error(
          `Unknown transport: ${type}`
        );
    }

    this.transports[type] =
      transport;

    return transport;
  }
}