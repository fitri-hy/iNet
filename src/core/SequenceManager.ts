export class SequenceManager {

  private sequences:
    Record<string, number> = {};

  next(
    goal: string
  ): number {

    if (
      !this.sequences[goal]
    ) {

      this.sequences[goal] = 0;
    }

    this.sequences[goal]++;

    return this.sequences[goal];
  }
}