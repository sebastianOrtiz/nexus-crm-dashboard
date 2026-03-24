import { Component, input, output } from '@angular/core';

/** Empty state placeholder with optional action button */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="mb-4 text-surface-600">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 class="text-base font-medium text-surface-200">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 text-sm text-surface-400">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button class="btn-primary mt-6" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  title = input('No hay datos');
  description = input('');
  actionLabel = input('');
  action = output<void>();
}
