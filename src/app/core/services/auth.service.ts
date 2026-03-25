import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, JwtPayload, LoginRequest, RegisterRequest, UserRole } from '../models/auth.model';
import { StorageService } from './storage.service';

/**
 * Auth service: handles login, register, logout and token management.
 * Exposes reactive signals for current user state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<JwtPayload | null>(this.decodeCurrentToken());

  /** Reactive current user state */
  readonly currentUser = this._currentUser.asReadonly();

  /** True when the user is authenticated */
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /** Current user's role */
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  /** True if user is owner or admin */
  readonly isAdminOrOwner = computed(() => {
    const role = this.userRole();
    return role === 'owner' || role === 'admin';
  });

  login(payload: LoginRequest): Observable<AuthTokens> {
    const form = new URLSearchParams();
    form.set('username', payload.email);
    form.set('password', payload.password);

    return this.http
      .post<AuthTokens>(`${environment.nexusCrmApiUrl}/api/v1/auth/token`, form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(tap((tokens) => this.handleTokens(tokens)));
  }

  register(payload: RegisterRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${environment.nexusCrmApiUrl}/api/v1/auth/register`, payload)
      .pipe(tap((tokens) => this.handleTokens(tokens)));
  }

  refresh(): Observable<AuthTokens> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http
      .post<AuthTokens>(`${environment.nexusCrmApiUrl}/api/v1/auth/refresh`, { refresh_token: refreshToken })
      .pipe(tap((tokens) => this.handleTokens(tokens)));
  }

  logout(): void {
    this.storage.clearTokens();
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser()?.role === role;
  }

  private handleTokens(tokens: AuthTokens): void {
    this.storage.setTokens(tokens.access_token, tokens.refresh_token);
    const payload = this.decodeToken(tokens.access_token);
    this._currentUser.set(payload);
  }

  private decodeCurrentToken(): JwtPayload | null {
    const token = this.storage.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as JwtPayload;
      // Check expiration
      if (decoded.exp * 1000 < Date.now()) {
        this.storage.clearTokens();
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }
}
