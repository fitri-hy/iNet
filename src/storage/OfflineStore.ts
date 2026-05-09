import { IntentFrame } from "../types";

export class OfflineStore {

  private frames: IntentFrame[] = [];

  save(frame: IntentFrame) {

    console.log(
      `[IntentNet] Stored offline ${frame.id}`
    );

    this.frames.push(frame);
  }

  getAll(): IntentFrame[] {

    return [...this.frames];
  }

  clear() {

    this.frames = [];
  }

  size(): number {

    return this.frames.length;
  }
}