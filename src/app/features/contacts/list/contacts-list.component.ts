import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '../../../core/constants';
import { SOURCE_LABELS } from '../../../core/labels';
import { Contact, ContactSource } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Contacts list page */
@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    BadgeComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Contactos</h1>
          <p class="text-sm text-surface-400 mt-1">{{ total() }} contactos en total</p>
        </div>
        <button class="btn-primary" (click)="goToCreate()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo contacto
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1 max-w-sm">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input class="input pl-10" type="search" placeholder="Buscar contactos..."
            [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" />
        </div>
        <select class="input w-auto" [(ngModel)]="sourceFilter" (ngModelChange)="loadContacts()">
          <option value="">Todas las fuentes</option>
          @for (source of sources; track source) {
            <option [value]="source">{{ sourceLabel(source) }}</option>
          }
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-surface-700">
        <table class="w-full">
          <thead class="bg-surface-800/80 border-b border-surface-700">
            <tr>
              <th class="table-header">Nombre</th>
              <th class="table-header">Email</th>
              <th class="table-header">Empresa</th>
              <th class="table-header">Fuente</th>
              <th class="table-header">Asignado a</th>
              <th class="table-header">Creado</th>
              <th class="table-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700 bg-surface-800">
            @if (loading()) {
              <tr>
                <td colspan="7" class="py-16">
                  <app-loading-spinner [fullPage]="true" />
                </td>
              </tr>
            } @else if (contacts().length === 0) {
              <tr>
                <td colspan="7">
                  <app-empty-state
                    title="Sin contactos"
                    description="Aún no tienes contactos. Crea el primero."
                    actionLabel="Nuevo contacto"
                    (action)="goToCreate()"
                  />
                </td>
              </tr>
            } @else {
              @for (contact of contacts(); track contact.id) {
                <tr class="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  (click)="goToDetail(contact.id)">
                  <td class="table-cell">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-medium text-primary-300 shrink-0">
                        {{ initials(contact) }}
                      </div>
                      <span class="font-medium text-surface-100">
                        {{ contact.first_name }} {{ contact.last_name }}
                      </span>
                    </div>
                  </td>
                  <td class="table-cell text-surface-400">{{ contact.email ?? '—' }}</td>
                  <td class="table-cell text-surface-400">{{ contact.company_name ?? '—' }}</td>
                  <td class="table-cell">
                    <app-badge [label]="sourceLabel(contact.source)" variant="info" />
                  </td>
                  <td class="table-cell text-surface-400">
                    {{ contact.assigned_to ? contact.assigned_to.first_name + ' ' + contact.assigned_to.last_name : '—' }}
                  </td>
                  <td class="table-cell text-surface-400">
                    {{ contact.created_at | date: 'dd/MM/yyyy' }}
                  </td>
                  <td class="table-cell text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1">
                      <button class="btn-ghost btn-sm p-1.5" title="Editar" (click)="goToEdit(contact.id)">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300" title="Eliminar"
                        (click)="confirmDelete(contact)">
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

      <!-- Pagination -->
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

    <!-- Delete confirmation -->
    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Eliminar contacto"
      [message]="'¿Eliminar a ' + (deleteTarget()?.first_name ?? '') + ' ' + (deleteTarget()?.last_name ?? '') + '? Esta acción no se puede deshacer.'"
      (confirm)="deleteContact()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class ContactsListComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  readonly contacts = signal<Contact[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly showDeleteDialog = signal(false);
  readonly deleteTarget = signal<Contact | null>(null);

  searchQuery = '';
  sourceFilter = '';

  readonly sources: ContactSource[] = ['manual', 'import', 'website', 'referral', 'social', 'other'];
  readonly pageSize = DEFAULT_PAGE_SIZE;

  readonly totalPages = () => Math.ceil(this.total() / this.pageSize);

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadContacts();
      });
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading.set(true);
    this.contactService
      .list({
        search: this.searchQuery || undefined,
        source: (this.sourceFilter as ContactSource) || undefined,
        page: this.currentPage(),
        page_size: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.contacts.set(res.items);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, 'Error al cargar contactos');
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadContacts();
  }

  goToCreate(): void {
    this.router.navigate(['/contacts/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/contacts', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/contacts', id, 'edit']);
  }

  confirmDelete(contact: Contact): void {
    this.deleteTarget.set(contact);
    this.showDeleteDialog.set(true);
  }

  deleteContact(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.contactService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.toast.success('Contacto eliminado');
          this.loadContacts();
        },
        error: (err: unknown) => {
          this.errorHandler.handle(err, 'Error al eliminar contacto');
        },
      });
  }

  initials(contact: Contact): string {
    return `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`.toUpperCase();
  }

  sourceLabel(source: ContactSource): string {
    return SOURCE_LABELS[source] ?? source;
  }
}
