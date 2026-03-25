import { Injectable, signal } from '@angular/core';
import { TOAST_DURATION_MS, TOAST_ERROR_DURATION_MS } from '../constants';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  severity: ToastSeverity;
  title: string;
  message?: string;
  duration?: number;
}

/**
 * Global toast notification service using Angular signals.
 * Components subscribe to the `toasts` signal to render notifications.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  /**
   * Displays a toast notification with the given severity, title, and optional message.
   * Auto-dismisses after the specified duration.
   * @param severity Visual type of the toast
   * @param title Short heading text
   * @param message Optional body text
   * @param duration Override auto-dismiss duration in milliseconds
   */
  show(severity: ToastSeverity, title: string, message?: string, duration?: number): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      severity,
      title,
      message,
      duration: duration ?? TOAST_DURATION_MS,
    };

    this.toasts.update((current) => [...current, toast]);

    setTimeout(() => this.dismiss(toast.id), toast.duration);
  }

  /** Shows a success toast. */
  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  /** Shows an error toast with a longer duration. */
  error(title: string, message?: string): void {
    this.show('error', title, message, TOAST_ERROR_DURATION_MS);
  }

  /** Shows a warning toast. */
  warning(title: string, message?: string): void {
    this.show('warning', title, message);
  }

  /** Shows an informational toast. */
  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  /**
   * Removes a toast from the list by its ID.
   * @param id Toast UUID to dismiss
   */
  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
