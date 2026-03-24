import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

/** Generic data table with search, pagination and loading states */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        @if (searchable()) {
          <div class="relative w-full sm:w-72">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
              />
            </svg>
            <input
              class="input pl-10"
              type="search"
              [placeholder]="searchPlaceholder()"
              [(ngModel)]="searchValue"
              (ngModelChange)="onSearch($event)"
            />
          </div>
        }
        <div class="flex items-center gap-2 ml-auto">
          <ng-content select="[actions]" />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-surface-700">
        <table class="w-full">
          <thead class="bg-surface-800/80 border-b border-surface-700">
            <tr>
              @for (col of columns(); track col.key) {
                <th
                  class="table-header"
                  [class.cursor-pointer]="col.sortable"
                  (click)="col.sortable && onSort(col.key)"
                >
                  <span class="flex items-center gap-1">
                    {{ col.label }}
                    @if (col.sortable) {
                      <svg class="h-3 w-3 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    }
                  </span>
                </th>
              }
              @if (hasActions()) {
                <th class="table-header text-right">Acciones</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700 bg-surface-800">
            @if (loading()) {
              <tr>
                <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)">
                  <app-loading-spinner [fullPage]="true" />
                </td>
              </tr>
            } @else if (rows().length === 0) {
              <tr>
                <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)">
                  <app-empty-state
                    [title]="emptyTitle()"
                    [description]="emptyDescription()"
                    [actionLabel]="emptyActionLabel()"
                    (action)="emptyAction.emit()"
                  />
                </td>
              </tr>
            } @else {
              @for (row of rows(); track trackByFn(row)) {
                <tr class="hover:bg-surface-700/50 transition-colors">
                  @for (col of columns(); track col.key) {
                    <td class="table-cell">
                      <ng-container
                        *ngTemplateOutlet="cellTemplate() || defaultCell; context: { row, col }"
                      />
                    </td>
                  }
                  @if (hasActions()) {
                    <td class="table-cell text-right">
                      <ng-container *ngTemplateOutlet="actionsTemplate() || null; context: { row }" />
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-between text-sm text-surface-400">
          <span>
            Mostrando {{ (currentPage() - 1) * pageSize() + 1 }}–{{
              [currentPage() * pageSize(), total()].sort((a, b) => a - b)[0]
            }}
            de {{ total() }}
          </span>
          <div class="flex items-center gap-1">
            <button
              class="btn-ghost btn-sm"
              [disabled]="currentPage() <= 1"
              (click)="pageChange.emit(currentPage() - 1)"
            >
              Anterior
            </button>
            @for (page of pageNumbers(); track page) {
              <button
                class="btn-sm rounded-lg px-3 py-1.5 text-xs font-medium"
                [class]="page === currentPage() ? 'bg-primary-600 text-white' : 'btn-ghost'"
                (click)="pageChange.emit(page)"
              >
                {{ page }}
              </button>
            }
            <button
              class="btn-ghost btn-sm"
              [disabled]="currentPage() >= totalPages()"
              (click)="pageChange.emit(currentPage() + 1)"
            >
              Siguiente
            </button>
          </div>
        </div>
      }
    </div>

    <ng-template #defaultCell let-row="row" let-col="col">
      {{ row[col.key] }}
    </ng-template>
  `,
})
export class DataTableComponent {
  columns = input.required<TableColumn[]>();
  rows = input<unknown[]>([]);
  loading = input(false);
  total = input(0);
  currentPage = input(1);
  pageSize = input(20);
  searchable = input(true);
  searchPlaceholder = input('Buscar...');
  emptyTitle = input('Sin resultados');
  emptyDescription = input('No se encontraron registros');
  emptyActionLabel = input('');
  hasActions = input(false);
  cellTemplate = input<import('@angular/core').TemplateRef<unknown> | null>(null);
  actionsTemplate = input<import('@angular/core').TemplateRef<unknown> | null>(null);

  search = output<string>();
  sort = output<string>();
  pageChange = output<number>();
  emptyAction = output<void>();

  searchValue = '';

  totalPages(): number {
    return Math.ceil(this.total() / this.pageSize());
  }

  pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  trackByFn(row: unknown): unknown {
    return (row as Record<string, unknown>)['id'] ?? row;
  }

  onSearch(value: string): void {
    this.search.emit(value);
  }

  onSort(key: string): void {
    this.sort.emit(key);
  }
}
