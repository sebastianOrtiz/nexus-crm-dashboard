import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Organization } from '../../../core/models/organization.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Organization settings page */
@Component({
  selector: 'app-settings-organization',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-xl space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-surface-100">Organización</h2>
        <p class="text-sm text-surface-400 mt-1">Configura los datos de tu organización</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10"><app-loading-spinner /></div>
      } @else {
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <app-form-field label="Nombre de la organización" fieldId="name" [required]="true"
              [error]="form.get('name')?.touched && form.get('name')?.invalid ? 'Requerido' : ''">
              <input id="name" type="text" class="input" formControlName="name" />
            </app-form-field>

            @if (org()) {
              <div>
                <p class="label">Slug (identificador)</p>
                <p class="text-sm text-surface-400 bg-surface-700 rounded-lg px-3 py-2">
                  {{ org()!.slug }}
                  <span class="text-surface-600 ml-2 text-xs">(no se puede cambiar)</span>
                </p>
              </div>
            }

            <div class="flex justify-end">
              <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid || !form.dirty">
                @if (saving()) { <app-loading-spinner size="sm" /> }
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class SettingsOrganizationComponent implements OnInit {
  private readonly orgService = inject(OrganizationService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly org = signal<Organization | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.orgService.getOrganization().subscribe({
      next: (o) => { this.org.set(o); this.form.patchValue({ name: o.name }); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.orgService.updateOrganization({ name: this.form.getRawValue().name! }).subscribe({
      next: (o) => { this.org.set(o); this.saving.set(false); this.form.markAsPristine(); this.toast.success('Organización actualizada'); },
      error: () => { this.saving.set(false); this.toast.error('Error', 'No se pudo actualizar'); },
    });
  }
}
