import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Company create/edit form */
@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <button class="btn-ghost p-2" (click)="goBack()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-surface-100">
          {{ isEdit() ? 'Editar empresa' : 'Nueva empresa' }}
        </h1>
      </div>

      @if (pageLoading()) {
        <div class="flex justify-center py-20"><app-loading-spinner size="lg" /></div>
      } @else {
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <app-form-field label="Nombre" fieldId="name" [required]="true" [error]="fieldError('name')">
              <input id="name" type="text" class="input" formControlName="name" placeholder="Acme Corp" />
            </app-form-field>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field label="Dominio" fieldId="domain">
                <input id="domain" type="text" class="input" formControlName="domain" placeholder="acme.com" />
              </app-form-field>
              <app-form-field label="Sitio web" fieldId="website">
                <input id="website" type="url" class="input" formControlName="website" placeholder="https://acme.com" />
              </app-form-field>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field label="Industria" fieldId="industry">
                <input id="industry" type="text" class="input" formControlName="industry" placeholder="Tecnología" />
              </app-form-field>
              <app-form-field label="Tamaño" fieldId="size">
                <select id="size" class="input" formControlName="size">
                  <option value="">Seleccionar</option>
                  <option value="1-10">1-10 empleados</option>
                  <option value="11-50">11-50 empleados</option>
                  <option value="51-200">51-200 empleados</option>
                  <option value="201-500">201-500 empleados</option>
                  <option value="500+">500+ empleados</option>
                </select>
              </app-form-field>
            </div>

            <app-form-field label="Teléfono" fieldId="phone">
              <input id="phone" type="tel" class="input" formControlName="phone" placeholder="+54 11 1234-5678" />
            </app-form-field>

            <app-form-field label="Dirección" fieldId="address">
              <input id="address" type="text" class="input" formControlName="address" placeholder="Av. Corrientes 1234" />
            </app-form-field>

            <app-form-field label="Notas" fieldId="notes">
              <textarea id="notes" class="input h-24 resize-none" formControlName="notes"
                placeholder="Información adicional..."></textarea>
            </app-form-field>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="btn-secondary" (click)="goBack()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid">
                @if (saving()) { <app-loading-spinner size="sm" /> }
                {{ isEdit() ? 'Guardar cambios' : 'Crear empresa' }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEdit = signal(false);
  readonly pageLoading = signal(false);
  readonly saving = signal(false);

  private companyId: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    domain: [''],
    website: [''],
    industry: [''],
    size: [''],
    phone: [''],
    address: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.isEdit.set(true);
      this.loadCompany(this.companyId);
    }
  }

  private loadCompany(id: string): void {
    this.pageLoading.set(true);
    this.companyService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (company) => {
          this.form.patchValue({
            name: company.name,
            domain: company.domain ?? '',
            website: company.website ?? '',
            industry: company.industry ?? '',
            size: company.size ?? '',
            phone: company.phone ?? '',
            address: company.address ?? '',
            notes: company.notes ?? '',
          });
          this.pageLoading.set(false);
        },
        error: (err: unknown) => {
          this.pageLoading.set(false);
          this.errorHandler.handle(err, 'Error al cargar la empresa');
          this.goBack();
        },
      });
  }

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Este campo es requerido';
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
      name: value.name!,
      domain: value.domain || null,
      website: value.website || null,
      industry: value.industry || null,
      size: value.size || null,
      phone: value.phone || null,
      address: value.address || null,
      notes: value.notes || null,
    };

    const req = this.isEdit()
      ? this.companyService.update(this.companyId!, payload)
      : this.companyService.create(payload);

    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (company) => {
        this.toast.success(this.isEdit() ? 'Empresa actualizada' : 'Empresa creada');
        this.router.navigate(['/companies', company.id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorHandler.handle(err, 'Error al guardar la empresa');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }
}
