export class ConnectionManager {

  private reconnectAttempts = 0;

  private maxReconnectAttempts = 5;

  private reconnectDelay = 2000;

  async reconnect(
    connectFn: () => Promise<void>
  ): Promise<void> {

    while (
      this.reconnectAttempts <
      this.maxReconnectAttempts
    ) {

      try {

        console.log(
          `[IntentNet] Reconnecting... (${this.reconnectAttempts + 1})`
        );

        await connectFn();

        console.log(
          "[IntentNet] Reconnected"
        );

        this.reconnectAttempts =
          0;

        return;

      } catch (error) {

        this.reconnectAttempts++;

        console.log(
          `[IntentNet] Reconnect failed (${this.reconnectAttempts})`
        );

        await this.sleep(
          this.reconnectDelay
        );
      }
    }

    throw new Error(
      "Reconnect failed"
    );
  }

  private sleep(
    ms: number
  ): Promise<void> {

    return new Promise(
      resolve =>
        setTimeout(resolve, ms)
    );
  }
}