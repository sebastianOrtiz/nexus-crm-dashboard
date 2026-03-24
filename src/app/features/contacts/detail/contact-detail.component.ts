import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Contact } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Contact detail view */
@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, BadgeComponent, ConfirmDialogComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else if (contact()) {
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <button class="btn-ghost p-2" (click)="goBack()">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-primary-600/30 flex items-center justify-center text-lg font-bold text-primary-300">
                {{ initials() }}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-surface-100">
                  {{ contact()!.first_name }} {{ contact()!.last_name }}
                </h1>
                <p class="text-sm text-surface-400">{{ contact()!.email ?? 'Sin email' }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/contacts', contact()!.id, 'edit']" class="btn-secondary">
              Editar
            </a>
            <button class="btn-danger" (click)="showDeleteDialog.set(true)">Eliminar</button>
          </div>
        </div>

        <!-- Info card -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">Información</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Teléfono</dt>
              <dd class="text-sm text-surface-200">{{ contact()!.phone ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Empresa</dt>
              <dd class="text-sm text-surface-200">{{ contact()!.company_name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Fuente</dt>
              <dd class="text-sm text-surface-200">
                <app-badge [label]="contact()!.source" variant="info" />
              </dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Asignado a</dt>
              <dd class="text-sm text-surface-200">
                {{ contact()!.assigned_to ? contact()!.assigned_to!.first_name + ' ' + contact()!.assigned_to!.last_name : '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Creado</dt>
              <dd class="text-sm text-surface-200">{{ contact()!.created_at | date: 'dd/MM/yyyy HH:mm' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">Actualizado</dt>
              <dd class="text-sm text-surface-200">{{ contact()!.updated_at | date: 'dd/MM/yyyy HH:mm' }}</dd>
            </div>
          </dl>

          @if (contact()!.notes) {
            <div class="mt-4 pt-4 border-t border-surface-700">
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-2">Notas</dt>
              <dd class="text-sm text-surface-300 whitespace-pre-line">{{ contact()!.notes }}</dd>
            </div>
          }
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Eliminar contacto"
      message="¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer."
      (confirm)="deleteContact()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class ContactDetailComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly contact = signal<Contact | null>(null);
  readonly loading = signal(true);
  readonly showDeleteDialog = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.contactService.getById(id).subscribe({
      next: (c) => { this.contact.set(c); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error', 'No se pudo cargar el contacto'); this.goBack(); },
    });
  }

  initials(): string {
    const c = this.contact();
    if (!c) return '?';
    return `${c.first_name.charAt(0)}${c.last_name.charAt(0)}`.toUpperCase();
  }

  deleteContact(): void {
    const c = this.contact();
    if (!c) return;
    this.contactService.remove(c.id).subscribe({
      next: () => { this.toast.success('Contacto eliminado'); this.router.navigate(['/contacts']); },
      error: () => this.toast.error('Error', 'No se pudo eliminar el contacto'),
    });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}
