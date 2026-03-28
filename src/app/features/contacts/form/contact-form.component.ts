import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactSource } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

import { CONTACT_SOURCES } from '../../../core/enums';

/** Contact create/edit form */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent, TranslatePipe],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
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
        <h1 class="text-2xl font-bold text-surface-100">
          {{ (isEdit() ? 'contacts.edit' : 'contacts.new') | translate }}
        </h1>
      </div>

      @if (pageLoading()) {
        <div class="flex justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field
                [label]="'contacts.form.first_name' | translate"
                fieldId="first_name"
                [required]="true"
                [error]="fieldError('first_name')"
              >
                <input
                  id="first_name"
                  type="text"
                  class="input"
                  formControlName="first_name"
                  placeholder="Juan"
                />
              </app-form-field>
              <app-form-field
                [label]="'contacts.form.last_name' | translate"
                fieldId="last_name"
                [required]="true"
                [error]="fieldError('last_name')"
              >
                <input
                  id="last_name"
                  type="text"
                  class="input"
                  formControlName="last_name"
                  placeholder="Pérez"
                />
              </app-form-field>
            </div>

            <app-form-field
              [label]="'contacts.form.email' | translate"
              fieldId="email"
              [error]="fieldError('email')"
            >
              <input
                id="email"
                type="email"
                class="input"
                formControlName="email"
                placeholder="juan@ejemplo.com"
              />
            </app-form-field>

            <app-form-field [label]="'contacts.form.phone' | translate" fieldId="phone">
              <input
                id="phone"
                type="tel"
                class="input"
                formControlName="phone"
                placeholder="+54 11 1234-5678"
              />
            </app-form-field>

            <app-form-field
              [label]="'contacts.form.source' | translate"
              fieldId="source"
              [required]="true"
            >
              <select id="source" class="input" formControlName="source">
                @for (src of sources; track src) {
                  <option [value]="src">{{ translate.t('source.' + src) }}</option>
                }
              </select>
            </app-form-field>

            <app-form-field [label]="'contacts.form.notes' | translate" fieldId="notes">
              <textarea
                id="notes"
                class="input h-24 resize-none"
                formControlName="notes"
                placeholder="Información adicional..."
              ></textarea>
            </app-form-field>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="btn-secondary" (click)="goBack()">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid">
                @if (saving()) {
                  <app-loading-spinner size="sm" />
                }
                {{ (isEdit() ? 'common.save' : 'contacts.form.create') | translate }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class ContactFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  readonly translate = inject(TranslateService);

  readonly isEdit = signal(false);
  readonly pageLoading = signal(false);
  readonly saving = signal(false);

  readonly sources = CONTACT_SOURCES;

  private contactId: string | null = null;

  readonly form = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.email]],
    phone: [''],
    source: ['other' as ContactSource, [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id');
    if (this.contactId) {
      this.isEdit.set(true);
      this.loadContact(this.contactId);
    }
  }

  private loadContact(id: string): void {
    this.pageLoading.set(true);
    this.contactService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contact) => {
          this.form.patchValue({
            first_name: contact.firstName,
            last_name: contact.lastName,
            email: contact.email ?? '',
            phone: contact.phone ?? '',
            source: contact.source,
            notes: contact.notes ?? '',
          });
          this.pageLoading.set(false);
        },
        error: (err: unknown) => {
          this.pageLoading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_contact'));
          this.goBack();
        },
      });
  }

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return this.translate.t('validation.required');
    if (ctrl.hasError('email')) return this.translate.t('validation.email_invalid_short');
    return this.translate.t('validation.invalid_field');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      firstName: value.first_name!,
      lastName: value.last_name!,
      email: value.email || null,
      phone: value.phone || null,
      source: value.source as ContactSource,
      notes: value.notes || null,
    };

    const request = this.isEdit()
      ? this.contactService.update(this.contactId!, payload)
      : this.contactService.create(payload);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (contact) => {
        this.toast.success(
          this.isEdit()
            ? this.translate.t('contacts.updated')
            : this.translate.t('contacts.created'),
        );
        this.router.navigate(['/contacts', contact.id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorHandler.handle(err, this.translate.t('error.save_contact'));
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}
