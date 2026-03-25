import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SOURCE_LABELS } from '../../../core/labels';
import { ContactSource } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const SOURCES: { value: ContactSource; label: string }[] = (
  Object.keys(SOURCE_LABELS) as ContactSource[]
).map((value) => ({ value, label: SOURCE_LABELS[value] }));

/** Contact create/edit form */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button class="btn-ghost p-2" (click)="goBack()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-surface-100">
          {{ isEdit() ? 'Editar contacto' : 'Nuevo contacto' }}
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
              <app-form-field label="Nombre" fieldId="first_name" [required]="true" [error]="fieldError('first_name')">
                <input id="first_name" type="text" class="input" formControlName="first_name" placeholder="Juan" />
              </app-form-field>
              <app-form-field label="Apellido" fieldId="last_name" [required]="true" [error]="fieldError('last_name')">
                <input id="last_name" type="text" class="input" formControlName="last_name" placeholder="Pérez" />
              </app-form-field>
            </div>

            <app-form-field label="Email" fieldId="email" [error]="fieldError('email')">
              <input id="email" type="email" class="input" formControlName="email" placeholder="juan@ejemplo.com" />
            </app-form-field>

            <app-form-field label="Teléfono" fieldId="phone">
              <input id="phone" type="tel" class="input" formControlName="phone" placeholder="+54 11 1234-5678" />
            </app-form-field>

            <app-form-field label="Fuente" fieldId="source" [required]="true">
              <select id="source" class="input" formControlName="source">
                @for (src of sources; track src.value) {
                  <option [value]="src.value">{{ src.label }}</option>
                }
              </select>
            </app-form-field>

            <app-form-field label="Notas" fieldId="notes">
              <textarea id="notes" class="input h-24 resize-none" formControlName="notes"
                placeholder="Información adicional..."></textarea>
            </app-form-field>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="btn-secondary" (click)="goBack()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid">
                @if (saving()) {
                  <app-loading-spinner size="sm" />
                }
                {{ isEdit() ? 'Guardar cambios' : 'Crear contacto' }}
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

  readonly isEdit = signal(false);
  readonly pageLoading = signal(false);
  readonly saving = signal(false);

  readonly sources = SOURCES;

  private contactId: string | null = null;

  readonly form = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.email]],
    phone: [''],
    source: ['manual' as ContactSource, [Validators.required]],
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
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email ?? '',
            phone: contact.phone ?? '',
            source: contact.source,
            notes: contact.notes ?? '',
          });
          this.pageLoading.set(false);
        },
        error: (err: unknown) => {
          this.pageLoading.set(false);
          this.errorHandler.handle(err, 'Error al cargar el contacto');
          this.goBack();
        },
      });
  }

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Este campo es requerido';
    if (ctrl.hasError('email')) return 'Email inválido';
    return 'Campo inválido';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      first_name: value.first_name!,
      last_name: value.last_name!,
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
        this.toast.success(this.isEdit() ? 'Contacto actualizado' : 'Contacto creado');
        this.router.navigate(['/contacts', contact.id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorHandler.handle(err, 'Error al guardar el contacto');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }
}
