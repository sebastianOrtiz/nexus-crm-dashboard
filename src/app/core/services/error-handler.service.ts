import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Centralized error handling service.
 * Extracts a human-readable message from HTTP or generic errors
 * and displays it via the ToastService.
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly toast = inject(ToastService);

  /**
   * Handles an unknown error by extracting its message and showing an error toast.
   * @param err The caught error (HttpErrorResponse, Error, or unknown)
   * @param context A short description of the operation that failed (e.g. 'Loading contacts')
   */
  handle(err: unknown, context: string): void {
    const message = this.extractMessage(err);
    this.toast.error(context, message);
  }

  /**
   * Extracts a user-friendly message from an unknown error.
   * Checks for FastAPI-style `error.detail`, then `error.message`, then falls back to a generic string.
   */
  private extractMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const httpErr = err as { error?: unknown; message?: string };

      if (httpErr.error && typeof httpErr.error === 'object') {
        const apiErr = httpErr.error as { detail?: string | { msg: string }[] };
        if (typeof apiErr.detail === 'string') {
          return apiErr.detail;
        }
        if (Array.isArray(apiErr.detail) && apiErr.detail.length > 0) {
          return apiErr.detail[0].msg;
        }
      }

      if (typeof httpErr.message === 'string' && httpErr.message) {
        return httpErr.message;
      }
    }

    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
