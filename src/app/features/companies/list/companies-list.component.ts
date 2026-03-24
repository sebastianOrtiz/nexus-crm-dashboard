import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { Company } from '../../../core/models/company.model';
import { CompanyService } from '../../../core/services/company.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Companies list page */
@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [DatePipe, FormsModule, ConfirmDialogComponent, EmptyStateComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Empresas</h1>
          <p class="text-sm text-surface-400 mt-1">{{ total() }} empresas en total</p>
        </div>
        <button class="btn-primary" (click)="goToCreate()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva empresa
        </button>
      </div>

      <div class="relative max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input class="input pl-10" type="search" placeholder="Buscar empresas..."
          [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" />
      </div>

      <div class="overflow-x-auto rounded-xl border border-surface-700">
        <table class="w-full">
          <thead class="bg-surface-800/80 border-b border-surface-700">
            <tr>
              <th class="table-header">Empresa</th>
              <th class="table-header">Industria</th>
              <th class="table-header">Tamaño</th>
              <th class="table-header">Sitio web</th>
              <th class="table-header">Creada</th>
              <th class="table-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700 bg-surface-800">
            @if (loading()) {
              <tr><td colspan="6" class="py-16"><app-loading-spinner [fullPage]="true" /></td></tr>
            } @else if (companies().length === 0) {
              <tr>
                <td colspan="6">
                  <app-empty-state
                    title="Sin empresas"
                    description="Aún no tienes empresas registradas."
                    actionLabel="Nueva empresa"
                    (action)="goToCreate()"
                  />
                </td>
              </tr>
            } @else {
              @for (company of companies(); track company.id) {
                <tr class="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  (click)="goToDetail(company.id)">
                  <td class="table-cell">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-lg bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-300 shrink-0">
                        {{ company.name.charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-medium text-surface-100">{{ company.name }}</span>
                    </div>
                  </td>
                  <td class="table-cell text-surface-400">{{ company.industry ?? '—' }}</td>
                  <td class="table-cell text-surface-400">{{ company.size ?? '—' }}</td>
                  <td class="table-cell">
                    @if (company.website) {
                      <a [href]="company.website" target="_blank" class="text-primary-400 hover:text-primary-300 text-sm"
                        (click)="$event.stopPropagation()">
                        {{ company.domain ?? company.website }}
                      </a>
                    } @else {
                      <span class="text-surface-500">—</span>
                    }
                  </td>
                  <td class="table-cell text-surface-400">{{ company.created_at | date: 'dd/MM/yyyy' }}</td>
                  <td class="table-cell text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1">
                      <button class="btn-ghost btn-sm p-1.5" (click)="goToEdit(company.id)">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                        (click)="confirmDelete(company)">
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
      title="Eliminar empresa"
      [message]="'¿Eliminar ' + (deleteTarget()?.name ?? '') + '?'"
      (confirm)="deleteCompany()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class CompaniesListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly searchSubject = new Subject<string>();

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly showDeleteDialog = signal(false);
  readonly deleteTarget = signal<Company | null>(null);

  searchQuery = '';
  readonly pageSize = 20;

  get totalPages(): () => number {
    return () => Math.ceil(this.total() / this.pageSize);
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage.set(1);
      this.loadCompanies();
    });
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading.set(true);
    this.companyService.list({ search: this.searchQuery || undefined, page: this.currentPage(), page_size: this.pageSize }).subscribe({
      next: (res) => { this.companies.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error', 'No se pudieron cargar las empresas'); },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  goToPage(page: number): void { this.currentPage.set(page); this.loadCompanies(); }
  goToCreate(): void { this.router.navigate(['/companies/new']); }
  goToDetail(id: string): void { this.router.navigate(['/companies', id]); }
  goToEdit(id: string): void { this.router.navigate(['/companies', id, 'edit']); }

  confirmDelete(company: Company): void {
    this.deleteTarget.set(company);
    this.showDeleteDialog.set(true);
  }

  deleteCompany(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.companyService.remove(target.id).subscribe({
      next: () => { this.showDeleteDialog.set(false); this.toast.success('Empresa eliminada'); this.loadCompanies(); },
      error: () => this.toast.error('Error', 'No se pudo eliminar la empresa'),
    });
  }
}
