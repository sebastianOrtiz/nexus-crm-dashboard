import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Registration page component */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormFieldComponent,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-surface-900 relative">
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
          <img src="logo.png" alt="NexusCRM" class="h-12 w-12 rounded-xl mb-4 mx-auto" />
          <h1 class="text-2xl font-bold text-surface-100">
            {{ 'auth.register_title' | translate }}
          </h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'auth.register_subtitle' | translate }}</p>
        </div>

        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <!-- Org info -->
            <div class="pb-2">
              <h3 class="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
                {{ 'auth.organization' | translate }}
              </h3>
              <div class="space-y-4">
                <app-form-field
                  [label]="'auth.org_name' | translate"
                  fieldId="org_name"
                  [required]="true"
                  [error]="fieldError('org_name')"
                >
                  <input
                    id="org_name"
                    type="text"
                    class="input"
                    formControlName="org_name"
                    placeholder="Acme Corp"
                    (input)="autoSlug()"
                  />
                </app-form-field>
                <app-form-field
                  [label]="'auth.org_slug' | translate"
                  fieldId="org_slug"
                  [required]="true"
                  [error]="fieldError('org_slug')"
                  [hint]="'auth.org_slug_hint' | translate"
                >
                  <input
                    id="org_slug"
                    type="text"
                    class="input"
                    formControlName="org_slug"
                    placeholder="acme-corp"
                    (input)="onSlugInput()"
                  />
                </app-form-field>
              </div>
            </div>

            <div class="divider"></div>

            <!-- User info -->
            <div class="pt-2">
              <h3 class="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
                {{ 'auth.your_account' | translate }}
              </h3>
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <app-form-field
                    [label]="'auth.first_name' | translate"
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
                    [label]="'auth.last_name' | translate"
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
                  [label]="'auth.email' | translate"
                  fieldId="email"
                  [required]="true"
                  [error]="fieldError('email')"
                >
                  <input
                    id="email"
                    type="email"
                    class="input"
                    [class.input-error]="fieldError('email')"
                    formControlName="email"
                    placeholder="tu@email.com"
                    autocomplete="email"
                  />
                </app-form-field>

                <!-- Password with strength checker -->
                <div>
                  <app-form-field
                    [label]="'auth.password' | translate"
                    fieldId="password"
                    [required]="true"
                    [error]="fieldError('password')"
                  >
                    <div class="relative">
                      <input
                        id="password"
                        [type]="showPassword() ? 'text' : 'password'"
                        class="input pr-10"
                        formControlName="password"
                        placeholder="••••••••"
                        autocomplete="new-password"
                      />
                      <button
                        type="button"
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-200 transition-colors"
                        (click)="showPassword.update(v => !v)"
                      >
                        @if (showPassword()) {
                          <svg
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        } @else {
                          <svg
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
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
                        }
                      </button>
                    </div>
                  </app-form-field>

                  @if (form.get('password')?.value) {
                    <div class="mt-3 space-y-3">
                      <!-- Strength bar -->
                      <div class="space-y-1">
                        <div class="flex gap-1">
                          @for (i of [1, 2, 3, 4]; track i) {
                            <div
                              class="h-1.5 flex-1 rounded-full transition-all duration-300"
                              [class]="
                                i <= passwordStrength() ? strengthBarColor() : 'bg-surface-700'
                              "
                            ></div>
                          }
                        </div>
                        <p class="text-xs font-medium" [class]="strengthTextColor()">
                          {{ strengthLabel() }}
                        </p>
                      </div>

                      <!-- Requirements checklist -->
                      <ul class="space-y-1.5">
                        <li
                          class="flex items-center gap-2 text-xs"
                          [class]="hasMinLength() ? 'text-green-400' : 'text-surface-500'"
                        >
                          <svg
                            class="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            @if (hasMinLength()) {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            } @else {
                              <circle cx="12" cy="12" r="9" stroke-width="2" />
                            }
                          </svg>
                          {{ 'auth.password_min_length' | translate }}
                        </li>
                        <li
                          class="flex items-center gap-2 text-xs"
                          [class]="hasLetter() ? 'text-green-400' : 'text-surface-500'"
                        >
                          <svg
                            class="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            @if (hasLetter()) {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            } @else {
                              <circle cx="12" cy="12" r="9" stroke-width="2" />
                            }
                          </svg>
                          {{ 'auth.password_needs_letter' | translate }}
                        </li>
                        <li
                          class="flex items-center gap-2 text-xs"
                          [class]="hasDigit() ? 'text-green-400' : 'text-surface-500'"
                        >
                          <svg
                            class="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            @if (hasDigit()) {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            } @else {
                              <circle cx="12" cy="12" r="9" stroke-width="2" />
                            }
                          </svg>
                          {{ 'auth.password_needs_digit' | translate }}
                        </li>
                        <li
                          class="flex items-center gap-2 text-xs"
                          [class]="hasUpper() ? 'text-green-400' : 'text-surface-500'"
                        >
                          <svg
                            class="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            @if (hasUpper()) {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            } @else {
                              <circle cx="12" cy="12" r="9" stroke-width="2" />
                            }
                          </svg>
                          {{ 'auth.password_has_upper' | translate }}
                        </li>
                        <li
                          class="flex items-center gap-2 text-xs"
                          [class]="hasSpecial() ? 'text-green-400' : 'text-surface-500'"
                        >
                          <svg
                            class="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            @if (hasSpecial()) {
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            } @else {
                              <circle cx="12" cy="12" r="9" stroke-width="2" />
                            }
                          </svg>
                          {{ 'auth.password_has_special' | translate }}
                        </li>
                      </ul>
                    </div>
                  }
                </div>

                <!-- Confirm password -->
                <app-form-field
                  [label]="'auth.confirm_password' | translate"
                  fieldId="confirm_password"
                  [required]="true"
                  [error]="confirmPasswordError()"
                >
                  <div class="relative">
                    <input
                      id="confirm_password"
                      [type]="showConfirmPassword() ? 'text' : 'password'"
                      class="input pr-10"
                      [class.input-error]="confirmPasswordError()"
                      formControlName="confirm_password"
                      placeholder="••••••••"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-200 transition-colors"
                      (click)="showConfirmPassword.update(v => !v)"
                    >
                      @if (showConfirmPassword()) {
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
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
                      }
                    </button>
                  </div>
                </app-form-field>
              </div>
            </div>

            <button
              type="submit"
              class="btn-primary w-full btn-lg mt-2"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <app-loading-spinner size="sm" />
                {{ 'auth.creating' | translate }}
              } @else {
                {{ 'auth.create' | translate }}
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-surface-400">
              {{ 'auth.has_account' | translate }}
              <a
                routerLink="/auth/login"
                class="text-primary-400 hover:text-primary-300 font-medium"
              >
                {{ 'auth.login_link' | translate }}
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandlerService);
  readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.group(
    {
      org_name: ['', [Validators.required, Validators.minLength(2)]],
      org_slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator },
  );

  private slugTouchedManually = false;

  autoSlug(): void {
    if (this.slugTouchedManually) return;
    const name = this.form.get('org_name')?.value ?? '';
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    this.form.get('org_slug')?.setValue(slug, { emitEvent: false });
  }

  onSlugInput(): void {
    this.slugTouchedManually = true;
    this.sanitizeSlug();
  }

  sanitizeSlug(): void {
    const ctrl = this.form.get('org_slug');
    if (!ctrl) return;
    const sanitized = ctrl
      .value!.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    ctrl.setValue(sanitized, { emitEvent: false });
  }

  // ── Password helpers ──

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value ?? '';
    if (!val) return null;
    if (!/[a-zA-Z]/.test(val)) return { noLetter: true };
    if (!/\d/.test(val)) return { noDigit: true };
    return null;
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm_password')?.value;
    if (!confirm) return null;
    return password === confirm ? null : { mismatch: true };
  }

  hasMinLength(): boolean {
    return (this.form.get('password')?.value ?? '').length >= 8;
  }

  hasLetter(): boolean {
    return /[a-zA-Z]/.test(this.form.get('password')?.value ?? '');
  }

  hasDigit(): boolean {
    return /\d/.test(this.form.get('password')?.value ?? '');
  }

  hasUpper(): boolean {
    return /[A-Z]/.test(this.form.get('password')?.value ?? '');
  }

  hasSpecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.form.get('password')?.value ?? '');
  }

  passwordStrength(): number {
    const val: string = this.form.get('password')?.value ?? '';
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[a-zA-Z]/.test(val) && /\d/.test(val)) score++;
    if (val.length >= 12) score++;
    if (/[^a-zA-Z0-9]/.test(val) && /[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    return score;
  }

  strengthLabel(): string {
    const keys = [
      'auth.password_strength.weak',
      'auth.password_strength.fair',
      'auth.password_strength.good',
      'auth.password_strength.strong',
    ];
    const s = this.passwordStrength();
    return this.translate.t(keys[Math.max(0, s - 1)] ?? keys[0]);
  }

  strengthBarColor(): string {
    const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-green-500'];
    return colors[Math.max(0, this.passwordStrength() - 1)] ?? colors[0];
  }

  strengthTextColor(): string {
    const colors = ['text-red-400', 'text-amber-400', 'text-yellow-400', 'text-green-400'];
    return colors[Math.max(0, this.passwordStrength() - 1)] ?? colors[0];
  }

  // ── Field errors ──

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if ((!ctrl?.touched && !ctrl?.dirty) || ctrl.valid) return '';
    if (ctrl.hasError('required')) return this.translate.t('validation.required');
    if (ctrl.hasError('email')) return this.translate.t('validation.email_invalid_short');
    if (ctrl.hasError('minlength')) {
      const min = ctrl.getError('minlength').requiredLength;
      return this.translate.t('validation.min_chars', { min });
    }
    if (ctrl.hasError('pattern')) return this.translate.t('validation.pattern_slug');
    if (ctrl.hasError('noLetter')) return this.translate.t('auth.password_needs_letter');
    if (ctrl.hasError('noDigit')) return this.translate.t('auth.password_needs_digit');
    return this.translate.t('validation.invalid_field');
  }

  confirmPasswordError(): string {
    const ctrl = this.form.get('confirm_password');
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return this.translate.t('validation.required');
    if (this.form.hasError('mismatch')) return this.translate.t('auth.passwords_mismatch');
    return '';
  }

  // ── Submit ──

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    this.authService
      .register({
        organization_name: value.org_name!,
        organization_slug: value.org_slug!,
        email: value.email!,
        password: value.password!,
        first_name: value.first_name!,
        last_name: value.last_name!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(
            this.translate.t('auth.register_success'),
            this.translate.t('auth.register_welcome'),
          );
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('auth.register_error'));
        },
      });
  }
}
