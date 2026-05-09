export class AckManager {

  private processed:
    Set<string> = new Set();

  isProcessed(
    id: string
  ): boolean {

    if (
      this.processed.has(id)
    ) {

      return true;
    }

    this.processed.add(id);

    return false;
  }
}