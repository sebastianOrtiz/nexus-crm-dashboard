import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Login page component */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormFieldComponent,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-surface-900 relative">
      <!-- Language toggle -->
      <button
        class="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-surface-100 transition-colors border border-surface-700"
        (click)="translate.toggleLang()"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        {{ translate.currentLang() === 'es' ? 'EN' : 'ES' }}
      </button>

      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div
            class="inline-flex h-12 w-12 rounded-xl bg-primary-600 items-center justify-center mb-4"
          >
            <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-surface-100">NexusCRM</h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'auth.login_title' | translate }}</p>
        </div>

        <!-- Form card -->
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <app-form-field
              [label]="'auth.email' | translate"
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
              [label]="'auth.password' | translate"
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
                {{ 'auth.logging_in' | translate }}
              } @else {
                {{ 'auth.login' | translate }}
              }
            </button>
          </form>

          <div class="divider my-5"></div>

          <button
            type="button"
            class="btn-secondary w-full"
            [disabled]="demoLoading()"
            (click)="loginAsDemo()"
          >
            @if (demoLoading()) {
              <app-loading-spinner size="sm" />
              {{ 'auth.demo_logging_in' | translate }}
            } @else {
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ 'auth.demo_login' | translate }}
            }
          </button>

          <div class="mt-5 text-center">
            <p class="text-sm text-surface-400">
              {{ 'auth.no_account' | translate }}
              <a
                routerLink="/auth/register"
                class="text-primary-400 hover:text-primary-300 font-medium"
              >
                {{ 'auth.register_link' | translate }}
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
  private readonly errorHandler = inject(ErrorHandlerService);
  readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly demoLoading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  emailError(): string {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return this.translate.t('validation.email_required');
    if (ctrl.hasError('email')) return this.translate.t('validation.email_invalid');
    return '';
  }

  passwordError(): string {
    const ctrl = this.form.get('password');
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return this.translate.t('validation.password_required');
    if (ctrl.hasError('minlength')) return this.translate.t('validation.min_chars', { min: 8 });
    return '';
  }

  loginAsDemo(): void {
    this.demoLoading.set(true);
    this.authService
      .login({ email: 'demo@nexuscrm.dev', password: 'Demo1234!' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(
            this.translate.t('auth.welcome'),
            this.translate.t('auth.login_success'),
          );
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.demoLoading.set(false);
          this.errorHandler.handle(err, this.translate.t('auth.login_error'));
        },
      });
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
          this.toast.success(
            this.translate.t('auth.welcome'),
            this.translate.t('auth.login_success'),
          );
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('auth.login_error'));
        },
      });
  }
}
