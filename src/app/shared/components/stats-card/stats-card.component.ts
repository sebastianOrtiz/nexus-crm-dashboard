import { Component, input } from '@angular/core';

/** Stats card for dashboard KPI display */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  template: `
    <div class="card flex items-start gap-4">
      <div class="rounded-lg p-3" [class]="iconBg()">
        <ng-content select="[icon]" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-surface-400 truncate">{{ label() }}</p>
        <p class="text-2xl font-bold text-surface-100 mt-0.5">{{ value() }}</p>
        @if (change() !== null) {
          <p class="text-xs mt-1" [class]="changePositive() ? 'text-green-400' : 'text-red-400'">
            {{ changePositive() ? '+' : '' }}{{ change() }}%
            <span class="text-surface-500 ml-1">vs mes anterior</span>
          </p>
        }
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  iconBg = input('bg-primary-600/20');
  change = input<number | null>(null);
  changePositive = input(true);
}
