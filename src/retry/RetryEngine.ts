export class RetryEngine {
  static async execute(
    fn: () => Promise<void>,
    retries = 3
  ): Promise<void> {

    let attempt = 0;

    while (attempt < retries) {
      try {
        await fn();
        return;
      } catch (err) {
        attempt++;

        console.log(
          `[IntentNet] Retry ${attempt}/${retries}`
        );

        if (attempt >= retries) {
          throw err;
        }
      }
    }
  }
}