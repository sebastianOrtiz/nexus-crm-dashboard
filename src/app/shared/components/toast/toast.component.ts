import { Component, inject } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';

const SEVERITY_CLASSES = {
  success: {
    container: 'border-green-500/30 bg-green-500/10',
    icon: 'text-green-400',
    title: 'text-green-300',
  },
  error: {
    container: 'border-red-500/30 bg-red-500/10',
    icon: 'text-red-400',
    title: 'text-red-300',
  },
  warning: {
    container: 'border-yellow-500/30 bg-yellow-500/10',
    icon: 'text-yellow-400',
    title: 'text-yellow-300',
  },
  info: {
    container: 'border-blue-500/30 bg-blue-500/10',
    icon: 'text-blue-400',
    title: 'text-blue-300',
  },
};

/** Toast notification container rendered at app root */
@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all"
          [class]="severityClass(toast).container"
        >
          <span [class]="severityClass(toast).icon">
            @switch (toast.severity) {
              @case ('success') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
              @case ('error') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              }
              @case ('warning') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              }
              @default {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            }
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium" [class]="severityClass(toast).title">
              {{ toast.title }}
            </p>
            @if (toast.message) {
              <p class="text-xs text-surface-400 mt-0.5">{{ toast.message }}</p>
            }
          </div>
          <button
            class="text-surface-500 hover:text-surface-300 transition-colors"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Cerrar notificación"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  severityClass(toast: Toast): (typeof SEVERITY_CLASSES)[keyof typeof SEVERITY_CLASSES] {
    return SEVERITY_CLASSES[toast.severity];
  }
}
