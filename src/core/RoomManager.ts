export class RoomManager {
  private currentRoom: string | null = null;

  public join(roomName: string): void {
    this.currentRoom = roomName;
    console.log(`[IntentNet] Room context set to: ${roomName}`);
  }

  public leave(): void {
    this.currentRoom = null;
  }

  public getActiveRoom(): string | null {
    return this.currentRoom;
  }
}