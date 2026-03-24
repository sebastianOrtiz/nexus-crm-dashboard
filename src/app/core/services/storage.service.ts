import { Injectable } from '@angular/core';

const KEYS = {
  ACCESS_TOKEN: 'crm_access_token',
  REFRESH_TOKEN: 'crm_refresh_token',
} as const;

/**
 * Thin wrapper over localStorage for token management.
 * Centralizes key names to avoid magic strings.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken();
  }
}
