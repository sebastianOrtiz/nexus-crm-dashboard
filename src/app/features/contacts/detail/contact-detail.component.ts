import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Contact } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Contact detail view */
@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [
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
        <div class="flex justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else if (contact()) {
        <!-- Header -->
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
            <div class="flex items-center gap-4">
              <div
                class="h-12 w-12 rounded-full bg-primary-600/30 flex items-center justify-center text-lg font-bold text-primary-300"
              >
                {{ initials() }}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-surface-100">
                  {{ contact()!.firstName }} {{ contact()!.lastName }}
                </h1>
                <p class="text-sm text-surface-400">
                  {{ contact()!.email ?? ('contacts.no_email' | translate) }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/contacts', contact()!.id, 'edit']" class="btn-secondary">
              {{ 'common.edit' | translate }}
            </a>
            <button class="btn-danger" (click)="showDeleteDialog.set(true)">
              {{ 'common.delete' | translate }}
            </button>
          </div>
        </div>

        <!-- Info card -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">
            {{ 'contacts.detail.info' | translate }}
          </h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                {{ 'contacts.detail.phone' | translate }}
              </dt>
              <dd class="text-sm text-surface-200">{{ contact()!.phone ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                {{ 'contacts.detail.company' | translate }}
              </dt>
              <dd class="text-sm text-surface-200">{{ contact()!.companyName ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                {{ 'contacts.detail.source' | translate }}
              </dt>
              <dd class="text-sm text-surface-200">
                <app-badge [label]="contact()!.source" variant="info" />
              </dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                {{ 'contacts.detail.assigned' | translate }}
              </dt>
              <dd class="text-sm text-surface-200">
                {{
                  contact()!.assignedTo
                    ? contact()!.assignedTo!.firstName + ' ' + contact()!.assignedTo!.lastName
                    : '—'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                {{ 'contacts.detail.created' | translate }}
              </dt>
              <dd class="text-sm text-surface-200">
                {{ contact()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-1">
                {{ 'contacts.detail.updated' | translate }}
              </dt>
              <dd class="text-sm text-surface-200">
                {{ contact()!.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
              </dd>
            </div>
          </dl>

          @if (contact()!.notes) {
            <div class="mt-4 pt-4 border-t border-surface-700">
              <dt class="text-xs text-surface-500 uppercase tracking-wider mb-2">
                {{ 'contacts.detail.notes' | translate }}
              </dt>
              <dd class="text-sm text-surface-300 whitespace-pre-line">{{ contact()!.notes }}</dd>
            </div>
          }
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      [title]="'contacts.delete_title' | translate"
      [message]="'contacts.detail.delete_msg' | translate"
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
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  readonly translate = inject(TranslateService);

  readonly contact = signal<Contact | null>(null);
  readonly loading = signal(true);
  readonly showDeleteDialog = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.contactService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.contact.set(c);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_contact'));
          this.goBack();
        },
      });
  }

  initials(): string {
    const c = this.contact();
    if (!c) return '?';
    return `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase();
  }

  deleteContact(): void {
    const c = this.contact();
    if (!c) return;
    this.contactService
      .remove(c.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(this.translate.t('contacts.deleted'));
          this.router.navigate(['/contacts']);
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.delete_contact')),
      });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}
