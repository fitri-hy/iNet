export class DeduplicationManager {

  private processed:
    Set<string> = new Set();

  isDuplicate(
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