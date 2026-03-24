import { Component, input } from '@angular/core';

/** Simple loading spinner with optional size variants */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center" [class]="containerClass()">
      <div
        class="animate-spin rounded-full border-2 border-surface-600 border-t-primary-500"
        [class]="spinnerClass()"
      ></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  fullPage = input(false);

  get containerClass(): () => string {
    return () => (this.fullPage() ? 'h-full w-full min-h-[200px]' : '');
  }

  get spinnerClass(): () => string {
    return () => {
      const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
      return sizes[this.size()];
    };
  }
}
