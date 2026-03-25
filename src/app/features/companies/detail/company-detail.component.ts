import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Company } from '../../../core/models/company.model';
import { CompanyService } from '../../../core/services/company.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Company detail view */
@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, ConfirmDialogComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      @if (loading()) {
        <div class="flex justify-center py-20"><app-loading-spinner size="lg" /></div>
      } @else if (company()) {
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <button class="btn-ghost p-2" (click)="goBack()">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-xl bg-surface-700 flex items-center justify-center text-lg font-bold text-surface-300">
                {{ company()!.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-surface-100">{{ company()!.name }}</h1>
                <p class="text-sm text-surface-400">{{ company()!.domain ?? company()!.website ?? 'Sin dominio' }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/companies', company()!.id, 'edit']" class="btn-secondary">Editar</a>
            <button class="btn-danger" (click)="showDeleteDialog.set(true)">Eliminar</button>
          </div>
        </div>

        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">Información</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Industria</dt>
              <dd class="text-sm text-surface-200">{{ company()!.industry ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Tamaño</dt>
              <dd class="text-sm text-surface-200">{{ company()!.size ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Teléfono</dt>
              <dd class="text-sm text-surface-200">{{ company()!.phone ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Dirección</dt>
              <dd class="text-sm text-surface-200">{{ company()!.address ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Creada</dt>
              <dd class="text-sm text-surface-200">{{ company()!.created_at | date: 'dd/MM/yyyy' }}</dd>
            </div>
          </dl>
          @if (company()!.notes) {
            <div class="mt-4 pt-4 border-t border-surface-700">
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-2">Notas</dt>
              <dd class="text-sm text-surface-300 whitespace-pre-line">{{ company()!.notes }}</dd>
            </div>
          }
        </div>

        @if (company()!.contacts && company()!.contacts!.length > 0) {
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">
              Contactos ({{ company()!.contacts!.length }})
            </h2>
            <div class="space-y-2">
              @for (contact of company()!.contacts!; track contact.id) {
                <a [routerLink]="['/contacts', contact.id]"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700 transition-colors">
                  <div class="h-8 w-8 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-medium text-primary-300 shrink-0">
                    {{ contact.first_name.charAt(0) }}{{ contact.last_name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-surface-100">{{ contact.first_name }} {{ contact.last_name }}</p>
                    <p class="text-xs text-surface-400">{{ contact.email ?? '—' }}</p>
                  </div>
                </a>
              }
            </div>
          </div>
        }
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Eliminar empresa"
      message="¿Estás seguro? Esta acción eliminará la empresa y no se puede deshacer."
      (confirm)="deleteCompany()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class CompanyDetailComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly company = signal<Company | null>(null);
  readonly loading = signal(true);
  readonly showDeleteDialog = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.companyService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.company.set(c);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, 'Error al cargar la empresa');
          this.goBack();
        },
      });
  }

  deleteCompany(): void {
    const c = this.company();
    if (!c) return;
    this.companyService
      .remove(c.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Empresa eliminada');
          this.router.navigate(['/companies']);
        },
        error: (err: unknown) => this.errorHandler.handle(err, 'Error al eliminar la empresa'),
      });
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }
}
