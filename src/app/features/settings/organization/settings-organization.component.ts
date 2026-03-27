import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Organization } from '../../../core/models/organization.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Organization settings page */
@Component({
  selector: 'app-settings-organization',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent, TranslatePipe],
  template: `
    <div class="max-w-xl space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-surface-100">
          {{ 'settings.org.title' | translate }}
        </h2>
        <p class="text-sm text-surface-400 mt-1">{{ 'settings.org.subtitle' | translate }}</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10"><app-loading-spinner /></div>
      } @else {
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <app-form-field
              [label]="'settings.org.name' | translate"
              fieldId="name"
              [required]="true"
              [error]="
                form.get('name')?.touched && form.get('name')?.invalid
                  ? ('validation.required_short' | translate)
                  : ''
              "
            >
              <input id="name" type="text" class="input" formControlName="name" />
            </app-form-field>

            @if (org()) {
              <div>
                <p class="label">{{ 'settings.org.slug' | translate }}</p>
                <p class="text-sm text-surface-400 bg-surface-700 rounded-lg px-3 py-2">
                  {{ org()!.slug }}
                  <span class="text-surface-600 ml-2 text-xs">{{
                    'settings.org.slug_readonly' | translate
                  }}</span>
                </p>
              </div>
            }

            <div class="flex justify-end">
              <button
                type="submit"
                class="btn-primary"
                [disabled]="saving() || form.invalid || !form.dirty"
              >
                @if (saving()) {
                  <app-loading-spinner size="sm" />
                }
                {{ 'common.save' | translate }}
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
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  readonly org = signal<Organization | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.orgService
      .getOrganization()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (o) => {
          this.org.set(o);
          this.form.patchValue({ name: o.name });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.orgService
      .updateOrganization({ name: this.form.getRawValue().name! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (o) => {
          this.org.set(o);
          this.saving.set(false);
          this.form.markAsPristine();
          this.toast.success(this.translate.t('settings.org.updated'));
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.errorHandler.handle(err, this.translate.t('error.update_org'));
        },
      });
  }
}
