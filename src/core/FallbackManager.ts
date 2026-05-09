import { BaseTransport }
from "../transports/BaseTransport";

export class FallbackManager {

  async execute(
    transports: BaseTransport[],
    sendFn: (
      transport: BaseTransport
    ) => Promise<void>
  ): Promise<void> {

    let lastError: any;

    for (const transport of transports) {

      try {

        await sendFn(transport);

        return;

      } catch (error) {

        lastError = error;

        console.log(
          `[IntentNet] Transport failed`
        );
      }
    }

    throw lastError;
  }
}