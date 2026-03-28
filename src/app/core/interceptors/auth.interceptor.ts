import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';
import { HTTP_STATUS_UNAUTHORIZED } from '../constants';
import { AuthTokens } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

let refreshInFlight$: Observable<AuthTokens> | null = null;

/**
 * HTTP interceptor that:
 * 1. Attaches the Bearer token to all outgoing requests.
 * 2. On 401, refreshes the token once and retries ALL queued requests.
 *
 * Uses shareReplay so concurrent 401s share the same refresh call.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);

  const token = storage.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== HTTP_STATUS_UNAUTHORIZED) {
        return throwError(() => error);
      }

      // Never retry auth endpoints — prevents infinite loops
      if (req.url.includes('/auth/')) {
        authService.logout();
        return throwError(() => error);
      }

      if (!storage.getRefreshToken()) {
        authService.logout();
        return throwError(() => error);
      }

      // If a refresh is already in flight, piggyback on it
      if (!refreshInFlight$) {
        refreshInFlight$ = authService.refresh().pipe(
          shareReplay(1),
        );

        // Clean up after refresh completes (success or error)
        refreshInFlight$.subscribe({
          error: () => {
            refreshInFlight$ = null;
            authService.logout();
          },
          complete: () => {
            refreshInFlight$ = null;
          },
        });
      }

      // Wait for refresh, then retry with the new token
      return refreshInFlight$.pipe(
        switchMap((tokens) => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${tokens.access_token}` },
          });
          return next(retryReq);
        }),
        catchError(() => {
          // Refresh failed — logout already handled above
          return throwError(() => error);
        }),
      );
    }),
  );
};
