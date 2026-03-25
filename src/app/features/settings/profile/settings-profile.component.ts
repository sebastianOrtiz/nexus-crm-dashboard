import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** User profile settings page */
@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-xl space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-surface-100">Mi perfil</h2>
        <p class="text-sm text-surface-400 mt-1">Actualiza tu información personal</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10"><app-loading-spinner /></div>
      } @else {
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <app-form-field label="Nombre" fieldId="first_name" [required]="true" [error]="fieldError('first_name')">
                <input id="first_name" type="text" class="input" formControlName="first_name" />
              </app-form-field>
              <app-form-field label="Apellido" fieldId="last_name" [required]="true" [error]="fieldError('last_name')">
                <input id="last_name" type="text" class="input" formControlName="last_name" />
              </app-form-field>
            </div>
            <app-form-field label="Email" fieldId="email" [required]="true" [error]="fieldError('email')">
              <input id="email" type="email" class="input" formControlName="email" />
            </app-form-field>
            <div class="flex justify-end">
              <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid || !form.dirty">
                @if (saving()) { <app-loading-spinner size="sm" /> }
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        @if (user()) {
          <div class="card">
            <h3 class="text-sm font-semibold text-surface-300 mb-2">Información de cuenta</h3>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm text-surface-400">Rol</dt>
                <dd class="text-sm text-surface-200 capitalize">{{ user()!.role }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-surface-400">Miembro desde</dt>
                <dd class="text-sm text-surface-200">{{ user()!.created_at.split('T')[0] }}</dd>
              </div>
            </dl>
          </div>
        }
      }
    </div>
  `,
})
export class SettingsProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.userService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (u) => {
          this.user.set(u);
          this.form.patchValue({ first_name: u.first_name, last_name: u.last_name, email: u.email });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Requerido';
    if (ctrl.hasError('email')) return 'Email inválido';
    return '';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.userService
      .updateProfile({ first_name: v.first_name!, last_name: v.last_name!, email: v.email! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (u) => {
          this.user.set(u);
          this.saving.set(false);
          this.form.markAsPristine();
          this.toast.success('Perfil actualizado');
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.errorHandler.handle(err, 'Error al actualizar el perfil');
        },
      });
  }
}
