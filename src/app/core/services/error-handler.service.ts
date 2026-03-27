import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { TranslateService } from './translate.service';

/**
 * Maps API error message patterns to translation keys.
 * Each entry is [regex, translationKey].
 */
const API_MESSAGE_MAP: [RegExp, string][] = [
  [/invalid email or password/i, 'api.invalid_credentials'],
  [/account is deactivated/i, 'api.account_deactivated'],
  [/slug .* is already taken/i, 'api.slug_taken'],
  [/email .* is already registered/i, 'api.email_taken'],
  [/user not found or deactivated/i, 'api.user_not_found'],
  [/cannot deactivate the organization owner/i, 'api.cannot_deactivate_owner'],
  [/cannot modify the organization owner/i, 'api.cannot_modify_owner'],
  [/cannot deactivate your own/i, 'api.cannot_deactivate_self'],
  [/viewers have read-only/i, 'api.readonly_access'],
  [/only owners and admins/i, 'api.no_permission'],
  [/viewers cannot/i, 'api.no_permission'],
  [/sales reps can only/i, 'api.no_permission'],
  [/not found$/i, 'api.not_found'],
];

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  handle(err: unknown, context: string): void {
    const message = this.extractMessage(err);
    this.toast.error(context, message);
  }

  private extractMessage(err: unknown): string {
    const raw = this.extractRawMessage(err);
    if (raw) {
      const match = API_MESSAGE_MAP.find(([regex]) => regex.test(raw));
      if (match) return this.translate.t(match[1]);
      return raw;
    }
    return this.translate.t('error.generic');
  }

  private extractRawMessage(err: unknown): string | null {
    if (err && typeof err === 'object') {
      const httpErr = err as { error?: unknown; message?: string };

      if (httpErr.error && typeof httpErr.error === 'object') {
        const apiErr = httpErr.error as { detail?: string | { msg: string }[] };
        if (typeof apiErr.detail === 'string') return apiErr.detail;
        if (Array.isArray(apiErr.detail) && apiErr.detail.length > 0) return apiErr.detail[0].msg;
      }

      if (typeof httpErr.message === 'string' && httpErr.message) return httpErr.message;
    }
    return null;
  }
}
