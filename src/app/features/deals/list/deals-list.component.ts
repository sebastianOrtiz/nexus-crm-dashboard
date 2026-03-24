import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Deal, DealStatus } from '../../../core/models/deal.model';
import { DealService } from '../../../core/services/deal.service';
import { PipelineService } from '../../../core/services/pipeline.service';
import { ToastService } from '../../../core/services/toast.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeVariant } from '../../../shared/components/badge/badge.component';

const STATUS_VARIANT: Record<DealStatus, BadgeVariant> = {
  open: 'info',
  won: 'success',
  lost: 'danger',
};

const STATUS_LABELS: Record<DealStatus, string> = {
  open: 'Abierto',
  won: 'Ganado',
  lost: 'Perdido',
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
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Deals</h1>
          <p class="text-sm text-surface-400 mt-1">{{ total() }} deals en total</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/deals/kanban" class="btn-secondary">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban
          </a>
          <button class="btn-primary" (click)="goToCreate()">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo deal
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <select class="input w-auto" [(ngModel)]="statusFilter" (ngModelChange)="loadDeals()">
          <option value="">Todos los estados</option>
          <option value="open">Abiertos</option>
          <option value="won">Ganados</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-xl border border-surface-700">
        <table class="w-full">
          <thead class="bg-surface-800/80 border-b border-surface-700">
            <tr>
              <th class="table-header">Título</th>
              <th class="table-header">Etapa</th>
              <th class="table-header">Estado</th>
              <th class="table-header">Valor</th>
              <th class="table-header">Contacto</th>
              <th class="table-header">Cierre est.</th>
              <th class="table-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700 bg-surface-800">
            @if (loading()) {
              <tr><td colspan="7" class="py-16"><app-loading-spinner [fullPage]="true" /></td></tr>
            } @else if (deals().length === 0) {
              <tr>
                <td colspan="7">
                  <app-empty-state title="Sin deals" description="Crea tu primer deal."
                    actionLabel="Nuevo deal" (action)="goToCreate()" />
                </td>
              </tr>
            } @else {
              @for (deal of deals(); track deal.id) {
                <tr class="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  (click)="goToDetail(deal.id)">
                  <td class="table-cell">
                    <span class="font-medium text-surface-100">{{ deal.title }}</span>
                  </td>
                  <td class="table-cell text-surface-400">{{ deal.stage?.name ?? '—' }}</td>
                  <td class="table-cell">
                    <app-badge [label]="statusLabel(deal.status)" [variant]="statusVariant(deal.status)" />
                  </td>
                  <td class="table-cell text-surface-200">
                    {{ deal.value != null ? (deal.value | currency: deal.currency) : '—' }}
                  </td>
                  <td class="table-cell text-surface-400">
                    {{ deal.contact ? deal.contact.first_name + ' ' + deal.contact.last_name : '—' }}
                  </td>
                  <td class="table-cell text-surface-400">
                    {{ deal.expected_close_date ? (deal.expected_close_date | date: 'dd/MM/yyyy') : '—' }}
                  </td>
                  <td class="table-cell text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1">
                      <button class="btn-ghost btn-sm p-1.5" (click)="goToEdit(deal.id)">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                        (click)="confirmDelete(deal)">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <span>Página {{ currentPage() }} de {{ totalPages() }}</span>
          <div class="flex gap-1">
            <button class="btn-ghost btn-sm" [disabled]="currentPage() <= 1" (click)="goToPage(currentPage() - 1)">Anterior</button>
            <button class="btn-ghost btn-sm" [disabled]="currentPage() >= totalPages()" (click)="goToPage(currentPage() + 1)">Siguiente</button>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Eliminar deal"
      [message]="'¿Eliminar ' + (deleteTarget()?.title ?? '') + '?'"
      (confirm)="deleteDeal()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class DealsListComponent implements OnInit {
  private readonly dealService = inject(DealService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly deals = signal<Deal[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly showDeleteDialog = signal(false);
  readonly deleteTarget = signal<Deal | null>(null);

  statusFilter = '';
  readonly pageSize = 20;

  get totalPages(): () => number {
    return () => Math.ceil(this.total() / this.pageSize);
  }

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.loading.set(true);
    this.dealService.list({
      status: (this.statusFilter as DealStatus) || undefined,
      page: this.currentPage(),
      page_size: this.pageSize,
    }).subscribe({
      next: (res) => { this.deals.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error', 'No se pudieron cargar los deals'); },
    });
  }

  goToPage(page: number): void { this.currentPage.set(page); this.loadDeals(); }
  goToCreate(): void { this.router.navigate(['/deals/new']); }
  goToDetail(id: string): void { this.router.navigate(['/deals', id]); }
  goToEdit(id: string): void { this.router.navigate(['/deals', id, 'edit']); }

  statusLabel(status: DealStatus): string { return STATUS_LABELS[status]; }
  statusVariant(status: DealStatus): BadgeVariant { return STATUS_VARIANT[status]; }

  confirmDelete(deal: Deal): void { this.deleteTarget.set(deal); this.showDeleteDialog.set(true); }

  deleteDeal(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.dealService.remove(target.id).subscribe({
      next: () => { this.showDeleteDialog.set(false); this.toast.success('Deal eliminado'); this.loadDeals(); },
      error: () => this.toast.error('Error', 'No se pudo eliminar el deal'),
    });
  }
}
