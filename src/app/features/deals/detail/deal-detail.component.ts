import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Deal, DealStatus } from '../../../core/models/deal.model';
import { DealService } from '../../../core/services/deal.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  open: 'info',
  won: 'success',
  lost: 'danger',
};

/** Deal detail view with stage history */
@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    BadgeComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      @if (loading()) {
        <div class="flex justify-center py-20"><app-loading-spinner size="lg" /></div>
      } @else if (deal()) {
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <button class="btn-ghost p-2" (click)="goBack()">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-surface-100">{{ deal()!.title }}</h1>
                <app-badge
                  [label]="statusLabel(deal()!.status)"
                  [variant]="statusVariant(deal()!.status)"
                />
              </div>
              <p class="text-sm text-surface-400 mt-1">
                {{ ('deals.detail.stage_label' | translate) + ': '
                }}{{ deal()!.stage?.name ?? '—' }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/deals', deal()!.id, 'edit']" class="btn-secondary">{{
              'common.edit' | translate
            }}</a>
            <button class="btn-danger" (click)="showDeleteDialog.set(true)">
              {{ 'common.delete' | translate }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">
              {{ 'deals.detail.info' | translate }}
            </h2>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                  {{ 'deals.detail.value' | translate }}
                </dt>
                <dd class="text-xl font-bold text-green-400">
                  {{ deal()!.value != null ? (deal()!.value! | currency: deal()!.currency) : '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                  {{ 'deals.detail.contact' | translate }}
                </dt>
                <dd class="text-sm text-surface-200">
                  @if (deal()!.contact) {
                    <a
                      [routerLink]="['/contacts', deal()!.contact!.id]"
                      class="text-primary-400 hover:text-primary-300"
                    >
                      {{ deal()!.contact!.first_name }} {{ deal()!.contact!.last_name }}
                    </a>
                  } @else {
                    —
                  }
                </dd>
              </div>
              <div>
                <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                  {{ 'deals.detail.company' | translate }}
                </dt>
                <dd class="text-sm text-surface-200">{{ deal()!.company_name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                  {{ 'deals.detail.assigned' | translate }}
                </dt>
                <dd class="text-sm text-surface-200">
                  {{
                    deal()!.assigned_to
                      ? deal()!.assigned_to!.first_name + ' ' + deal()!.assigned_to!.last_name
                      : '—'
                  }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                  {{ 'deals.detail.close_date' | translate }}
                </dt>
                <dd class="text-sm text-surface-200">
                  {{
                    deal()!.expected_close_date
                      ? (deal()!.expected_close_date! | date: 'dd/MM/yyyy')
                      : '—'
                  }}
                </dd>
              </div>
            </dl>
            @if (deal()!.notes) {
              <div class="mt-4 pt-4 border-t border-surface-700">
                <dt class="text-xs text-surface-500 uppercase tracking-wider mb-2">
                  {{ 'deals.detail.notes' | translate }}
                </dt>
                <dd class="text-sm text-surface-300 whitespace-pre-line">{{ deal()!.notes }}</dd>
              </div>
            }
          </div>

          <!-- Stage history -->
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">
              {{ 'deals.detail.stage_history' | translate }}
            </h2>
            @if (deal()!.stage_history.length === 0) {
              <p class="text-sm text-surface-500">{{ 'deals.detail.no_history' | translate }}</p>
            } @else {
              <div class="space-y-3">
                @for (entry of deal()!.stage_history; track entry.id) {
                  <div class="flex items-start gap-3">
                    <div class="h-2 w-2 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p class="text-sm text-surface-200 font-medium">{{ entry.stage_name }}</p>
                      <p class="text-xs text-surface-500">
                        {{ entry.entered_at | date: 'dd/MM/yyyy HH:mm' }}
                        @if (entry.exited_at) {
                          → {{ entry.exited_at | date: 'dd/MM/yyyy HH:mm' }}
                        } @else {
                          <span class="text-primary-400">{{
                            'deals.detail.current' | translate
                          }}</span>
                        }
                      </p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      [title]="'deals.delete_title' | translate"
      [message]="'deals.detail.delete_msg' | translate"
      (confirm)="deleteDeal()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class DealDetailComponent implements OnInit {
  private readonly dealService = inject(DealService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly deal = signal<Deal | null>(null);
  readonly loading = signal(true);
  readonly showDeleteDialog = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.dealService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => {
          this.deal.set(d);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_deal'));
          this.goBack();
        },
      });
  }

  statusLabel(status: DealStatus): string {
    return this.translate.t('deal_status.' + status);
  }

  statusVariant(status: string): BadgeVariant {
    return STATUS_VARIANT[status] ?? 'default';
  }

  deleteDeal(): void {
    const d = this.deal();
    if (!d) return;
    this.dealService
      .remove(d.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(this.translate.t('deals.deleted'));
          this.router.navigate(['/deals']);
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.delete_deal')),
      });
  }

  goBack(): void {
    this.router.navigate(['/deals']);
  }
}
