import { IntentFrame }
from "../types";

export class IntentQueue {

  private queue:
    IntentFrame[] = [];

  enqueue(frame: IntentFrame) {

    this.queue.push(frame);

    this.queue.sort(
      (a, b) =>
        b.priority - a.priority
    );
  }

  dequeue():
    IntentFrame | undefined {

    return this.queue.shift();
  }

  size(): number {

    return this.queue.length;
  }

  debug() {

    console.table(

      this.queue.map(q => ({
        id: q.id,
        goal: q.goal,
        priority: q.priority
      }))

    );
  }
}