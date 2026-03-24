import { Component, input } from '@angular/core';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'pink';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-700 text-surface-300',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  pink: 'bg-pink-500/20 text-pink-400',
};

/** Status badge component for displaying typed statuses */
@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="variantClass()">
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  label = input.required<string>();
  variant = input<BadgeVariant>('default');

  variantClass(): string {
    return VARIANT_CLASSES[this.variant()];
  }
}
