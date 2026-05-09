export class PendingManager {
  private pending = new Map<
    string,
    {
      resolve: () => void;
      reject: (err: any) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  add(
    id: string,
    resolve: () => void,
    reject: (err: any) => void,
    timeout: NodeJS.Timeout
  ) {
    this.pending.set(id, {
      resolve,
      reject,
      timeout
    });
  }

  resolve(id: string) {
    const item = this.pending.get(id);

    if (!item) return;

    clearTimeout(item.timeout);

    item.resolve();

    this.pending.delete(id);
  }

  reject(id: string, err: any) {
    const item = this.pending.get(id);

    if (!item) return;

    clearTimeout(item.timeout);

    item.reject(err);

    this.pending.delete(id);
  }
}