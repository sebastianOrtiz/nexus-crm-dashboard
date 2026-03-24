import { Component, input, output } from '@angular/core';

/** Generic modal/dialog wrapper component */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="close.emit()"></div>

        <!-- Modal panel -->
        <div
          class="relative w-full bg-surface-800 rounded-xl border border-surface-700 shadow-2xl flex flex-col max-h-[90vh]"
          [class]="sizeClass()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-surface-700">
            <h2 class="text-lg font-semibold text-surface-100">{{ title() }}</h2>
            <button class="btn-ghost p-1 -mr-1" (click)="close.emit()" aria-label="Cerrar">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <ng-content />
          </div>

          <!-- Footer -->
          @if (hasFooter()) {
            <div class="border-t border-surface-700 px-6 py-4">
              <ng-content select="[footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  isOpen = input(false);
  title = input('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  hasFooter = input(true);
  close = output<void>();

  sizeClass(): string {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };
    return sizes[this.size()];
  }
}
