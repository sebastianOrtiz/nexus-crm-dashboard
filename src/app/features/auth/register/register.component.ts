import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Registration page component */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-surface-900">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div
            class="inline-flex h-12 w-12 rounded-xl bg-primary-600 items-center justify-center mb-4"
          >
            <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-surface-100">Crear cuenta</h1>
          <p class="text-sm text-surface-400 mt-1">Crea tu organización en NexusCRM</p>
        </div>

        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <!-- Org info -->
            <div class="pb-2">
              <h3 class="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
                Organización
              </h3>
              <div class="space-y-4">
                <app-form-field label="Nombre de la organización" fieldId="org_name" [required]="true" [error]="fieldError('org_name')">
                  <input id="org_name" type="text" class="input" formControlName="org_name" placeholder="Acme Corp" />
                </app-form-field>
                <app-form-field label="Slug (identificador único)" fieldId="org_slug" [required]="true" [error]="fieldError('org_slug')" hint="Solo letras, números y guiones. Ej: acme-corp">
                  <input id="org_slug" type="text" class="input" formControlName="org_slug" placeholder="acme-corp" />
                </app-form-field>
              </div>
            </div>

            <div class="divider"></div>

            <!-- User info -->
            <div class="pt-2">
              <h3 class="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
                Tu cuenta
              </h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <app-form-field label="Nombre" fieldId="first_name" [required]="true" [error]="fieldError('first_name')">
                    <input id="first_name" type="text" class="input" formControlName="first_name" placeholder="Juan" />
                  </app-form-field>
                  <app-form-field label="Apellido" fieldId="last_name" [required]="true" [error]="fieldError('last_name')">
                    <input id="last_name" type="text" class="input" formControlName="last_name" placeholder="Pérez" />
                  </app-form-field>
                </div>
                <app-form-field label="Email" fieldId="email" [required]="true" [error]="fieldError('email')">
                  <input id="email" type="email" class="input" formControlName="email" placeholder="tu@email.com" autocomplete="email" />
                </app-form-field>
                <app-form-field label="Contraseña" fieldId="password" [required]="true" [error]="fieldError('password')" hint="Mínimo 8 caracteres">
                  <input id="password" type="password" class="input" formControlName="password" placeholder="••••••••" autocomplete="new-password" />
                </app-form-field>
              </div>
            </div>

            <button type="submit" class="btn-primary w-full btn-lg mt-2" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <app-loading-spinner size="sm" />
                Creando cuenta...
              } @else {
                Crear cuenta
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-surface-400">
              ¿Ya tienes cuenta?
              <a routerLink="/auth/login" class="text-primary-400 hover:text-primary-300 font-medium">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    org_name: ['', [Validators.required, Validators.minLength(2)]],
    org_slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Este campo es requerido';
    if (ctrl.hasError('email')) return 'Email inválido';
    if (ctrl.hasError('minlength')) {
      const min = ctrl.getError('minlength').requiredLength;
      return `Mínimo ${min} caracteres`;
    }
    if (ctrl.hasError('pattern')) return 'Solo letras minúsculas, números y guiones';
    return 'Campo inválido';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    this.authService
      .register({
        org_name: value.org_name!,
        org_slug: value.org_slug!,
        email: value.email!,
        password: value.password!,
        first_name: value.first_name!,
        last_name: value.last_name!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Cuenta creada', 'Bienvenido a NexusCRM');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.detail ?? 'Error al crear la cuenta. Intenta de nuevo.';
          this.toast.error('Error en el registro', typeof msg === 'string' ? msg : 'Verifica los datos');
        },
      });
  }
}
