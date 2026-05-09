export class Crypto {
  static encrypt(data: any, key: string): string {
    const str = JSON.stringify(data);
    return btoa(encodeURIComponent(str) + key);
  }

  static decrypt(cipher: string, key: string): any {
    const decoded = atob(cipher);
    const raw = decoded.replace(key, "");
    return JSON.parse(decodeURIComponent(raw));
  }
}