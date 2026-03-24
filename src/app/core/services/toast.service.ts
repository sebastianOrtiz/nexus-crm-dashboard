import { Injectable, signal } from '@angular/core';

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

  private readonly defaultDuration = 4000;

  show(severity: ToastSeverity, title: string, message?: string, duration?: number): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      severity,
      title,
      message,
      duration: duration ?? this.defaultDuration,
    };

    this.toasts.update((current) => [...current, toast]);

    setTimeout(() => this.dismiss(toast.id), toast.duration);
  }

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  error(title: string, message?: string): void {
    this.show('error', title, message, 6000);
  }

  warning(title: string, message?: string): void {
    this.show('warning', title, message);
  }

  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
