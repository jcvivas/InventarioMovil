import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly KEY = 'inventario_token';

  set(token: string): void {
    localStorage.setItem(this.KEY, token);
  }

  get(): string | null {
    return localStorage.getItem(this.KEY);
  }

  clear(): void {
    localStorage.removeItem(this.KEY);
  }

  isExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return true;

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(atob(base64)) as { exp?: number };

      if (!json.exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return now >= json.exp;
    } catch {
      return true;
    }
  }
}
