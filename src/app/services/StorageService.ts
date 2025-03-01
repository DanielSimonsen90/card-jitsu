import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private isBrowser: boolean;
  private serverStorage = new Map<string, string>(); // Server-side fallback

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  public setItem(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    } else {
      this.serverStorage.set(key, value); // Store in memory on the server
    }
  }

  public getItem(key: string): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(key);
    } else {
      return this.serverStorage.get(key) || null;
    }
  }

  public removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    } else {
      this.serverStorage.delete(key);
    }
  }
}
