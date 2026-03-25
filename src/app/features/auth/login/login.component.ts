import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Login page component */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-surface-900">
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
          <h1 class="text-2xl font-bold text-surface-100">NexusCRM</h1>
          <p class="text-sm text-surface-400 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Form card -->
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <app-form-field
              label="Email"
              fieldId="email"
              [required]="true"
              [error]="emailError()"
            >
              <input
                id="email"
                type="email"
                class="input"
                [class.input-error]="emailError()"
                formControlName="email"
                placeholder="tu@email.com"
                autocomplete="email"
              />
            </app-form-field>

            <app-form-field
              label="Contraseña"
              fieldId="password"
              [required]="true"
              [error]="passwordError()"
            >
              <input
                id="password"
                type="password"
                class="input"
                [class.input-error]="passwordError()"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </app-form-field>

            <button
              type="submit"
              class="btn-primary w-full btn-lg"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <app-loading-spinner size="sm" />
                Iniciando sesión...
              } @else {
                Iniciar sesión
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-surface-400">
              ¿No tienes cuenta?
              <a routerLink="/auth/register" class="text-primary-400 hover:text-primary-300 font-medium">
                Regístrate
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  emailError(): string {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return 'El email es requerido';
    if (ctrl.hasError('email')) return 'Ingresa un email válido';
    return '';
  }

  passwordError(): string {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return 'La contraseña es requerida';
    if (ctrl.hasError('minlength')) return 'Mínimo 8 caracteres';
    return '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService
      .login({ email: email!, password: password! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Bienvenido', 'Has iniciado sesión correctamente');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Error al iniciar sesión', 'Verifica tus credenciales e intenta de nuevo');
        },
      });
  }
}
