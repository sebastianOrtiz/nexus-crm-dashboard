import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DEFAULT_PAGE_SIZE } from '../../../core/constants';
import { Deal, DealStatus } from '../../../core/models/deal.model';
import { DealService } from '../../../core/services/deal.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const STATUS_VARIANT: Record<DealStatus, BadgeVariant> = {
  open: 'info',
  won: 'success',
  lost: 'danger',
};

/** Deals list page */
@Component({
  selector: 'app-deals-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    BadgeComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">{{ 'deals.title' | translate }}</h1>
          <p class="text-sm text-surface-400 mt-1">
            {{ translate.t('deals.total', { count: total() }) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/deals/kanban" class="btn-secondary">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            {{ 'deals.kanban_view' | translate }}
          </a>
          <button class="btn-primary" (click)="goToCreate()">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {{ 'deals.new' | translate }}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <select class="input w-auto" [(ngModel)]="statusFilter" (ngModelChange)="loadDeals()">
          <option value="">{{ 'deals.all_statuses' | translate }}</option>
          <option value="open">{{ 'deals.status.open' | translate }}</option>
          <option value="won">{{ 'deals.status.won' | translate }}</option>
          <option value="lost">{{ 'deals.status.lost' | translate }}</option>
        </select>
      </div>

      <!-- Mobile cards (visible below md) -->
      <div class="md:hidden space-y-3">
        @if (loading()) {
          <div class="flex justify-center py-16"><app-loading-spinner size="lg" /></div>
        } @else if (deals().length === 0) {
          <app-empty-state
            [title]="'deals.empty_title' | translate"
            [description]="'deals.empty_desc' | translate"
            [actionLabel]="'deals.new' | translate"
            (action)="goToCreate()"
          />
        } @else {
          @for (deal of deals(); track deal.id) {
            <div
              class="bg-surface-800 rounded-xl border border-surface-700 p-4 cursor-pointer hover:border-surface-600 transition-colors"
              (click)="goToDetail(deal.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-surface-100 truncate">{{ deal.title }}</p>
                  <p class="text-xs text-surface-400 mt-0.5">{{ deal.stage?.name ?? '—' }}</p>
                </div>
                <app-badge
                  [label]="statusLabel(deal.status)"
                  [variant]="statusVariant(deal.status)"
                />
              </div>
              @if (deal.value != null) {
                <p class="text-sm text-green-400 font-medium mt-2">
                  {{ deal.value | currency: deal.currency }}
                </p>
              }
              <div
                class="flex items-center justify-end gap-1 mt-3"
                (click)="$event.stopPropagation()"
              >
                <button class="btn-ghost btn-sm p-1.5" (click)="goToEdit(deal.id)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                  (click)="confirmDelete(deal)"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Table (visible from md) -->
      <div class="hidden md:block overflow-x-auto rounded-xl border border-surface-700">
        <table class="w-full">
          <thead class="bg-surface-800/80 border-b border-surface-700">
            <tr>
              <th class="table-header">{{ 'deals.col.title' | translate }}</th>
              <th class="table-header">{{ 'deals.col.stage' | translate }}</th>
              <th class="table-header">{{ 'deals.col.status' | translate }}</th>
              <th class="table-header">{{ 'deals.col.value' | translate }}</th>
              <th class="table-header">{{ 'deals.col.contact' | translate }}</th>
              <th class="table-header">{{ 'deals.col.close_date' | translate }}</th>
              <th class="table-header text-right">{{ 'deals.col.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700 bg-surface-800">
            @if (loading()) {
              <tr>
                <td colspan="7" class="py-16"><app-loading-spinner [fullPage]="true" /></td>
              </tr>
            } @else if (deals().length === 0) {
              <tr>
                <td colspan="7">
                  <app-empty-state
                    [title]="'deals.empty_title' | translate"
                    [description]="'deals.empty_desc' | translate"
                    [actionLabel]="'deals.new' | translate"
                    (action)="goToCreate()"
                  />
                </td>
              </tr>
            } @else {
              @for (deal of deals(); track deal.id) {
                <tr
                  class="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  (click)="goToDetail(deal.id)"
                >
                  <td class="table-cell">
                    <span class="font-medium text-surface-100">{{ deal.title }}</span>
                  </td>
                  <td class="table-cell text-surface-400">{{ deal.stage?.name ?? '—' }}</td>
                  <td class="table-cell">
                    <app-badge
                      [label]="statusLabel(deal.status)"
                      [variant]="statusVariant(deal.status)"
                    />
                  </td>
                  <td class="table-cell text-surface-200">
                    {{ deal.value != null ? (deal.value | currency: deal.currency) : '—' }}
                  </td>
                  <td class="table-cell text-surface-400">
                    {{ deal.contact ? deal.contact.firstName + ' ' + deal.contact.lastName : '—' }}
                  </td>
                  <td class="table-cell text-surface-400">
                    {{
                      deal.expectedCloseDate ? (deal.expectedCloseDate | date: 'dd/MM/yyyy') : '—'
                    }}
                  </td>
                  <td class="table-cell text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1">
                      <button class="btn-ghost btn-sm p-1.5" (click)="goToEdit(deal.id)">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                        (click)="confirmDelete(deal)"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (totalPages() > 1) {
        <div class="flex items-center justify-between text-sm text-surface-400">
          <span>{{
            translate.t('common.page_of', { current: currentPage(), total: totalPages() })
          }}</span>
          <div class="flex gap-1">
            <button
              class="btn-ghost btn-sm"
              [disabled]="currentPage() <= 1"
              (click)="goToPage(currentPage() - 1)"
            >
              {{ 'common.previous' | translate }}
            </button>
            <button
              class="btn-ghost btn-sm"
              [disabled]="currentPage() >= totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              {{ 'common.next' | translate }}
            </button>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      [title]="'deals.delete_title' | translate"
      [message]="translate.t('deals.delete_msg', { name: deleteTarget()?.title ?? '' })"
      (confirm)="deleteDeal()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class DealsListComponent implements OnInit {
  private readonly dealService = inject(DealService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  readonly translate = inject(TranslateService);

  readonly deals = signal<Deal[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly showDeleteDialog = signal(false);
  readonly deleteTarget = signal<Deal | null>(null);

  statusFilter = '';
  readonly pageSize = DEFAULT_PAGE_SIZE;

  readonly totalPages = () => Math.ceil(this.total() / this.pageSize);

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.loading.set(true);
    this.dealService
      .list({
        status: (this.statusFilter as DealStatus) || undefined,
        page: this.currentPage(),
        pageSize: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.deals.set(res.items);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_deals'));
        },
      });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadDeals();
  }

  goToCreate(): void {
    this.router.navigate(['/deals/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/deals', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/deals', id, 'edit']);
  }

  statusLabel(status: DealStatus): string {
    return this.translate.t('deal_status.' + status);
  }

  statusVariant(status: DealStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }

  confirmDelete(deal: Deal): void {
    this.deleteTarget.set(deal);
    this.showDeleteDialog.set(true);
  }

  deleteDeal(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.dealService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.toast.success(this.translate.t('deals.deleted'));
          this.loadDeals();
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.delete_deal')),
      });
  }
}
