import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PipelineStage } from '../../../core/models/pipeline.model';
import { DealService } from '../../../core/services/deal.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PipelineService } from '../../../core/services/pipeline.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Deal create/edit form */
@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, LoadingSpinnerComponent, TranslatePipe],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
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
          {{ (isEdit() ? 'deals.edit' : 'deals.new') | translate }}
        </h1>
      </div>

      @if (pageLoading()) {
        <div class="flex justify-center py-20"><app-loading-spinner size="lg" /></div>
      } @else {
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <app-form-field
              [label]="'deals.form.title' | translate"
              fieldId="title"
              [required]="true"
              [error]="fieldError('title')"
            >
              <input
                id="title"
                type="text"
                class="input"
                formControlName="title"
                placeholder="Nombre del deal"
              />
            </app-form-field>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field [label]="'deals.form.value' | translate" fieldId="value">
                <input
                  id="value"
                  type="number"
                  class="input"
                  formControlName="value"
                  placeholder="0.00"
                  min="0"
                />
              </app-form-field>
              <app-form-field [label]="'deals.form.currency' | translate" fieldId="currency">
                <select id="currency" class="input" formControlName="currency">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="ARS">ARS</option>
                  <option value="MXN">MXN</option>
                </select>
              </app-form-field>
            </div>

            <app-form-field
              [label]="'deals.form.stage' | translate"
              fieldId="stage_id"
              [required]="true"
              [error]="fieldError('stage_id')"
            >
              <select id="stage_id" class="input" formControlName="stage_id">
                <option value="">{{ 'deals.form.select_stage' | translate }}</option>
                @for (stage of stages(); track stage.id) {
                  <option [value]="stage.id">{{ stage.name }}</option>
                }
              </select>
            </app-form-field>

            <app-form-field
              [label]="'deals.form.close_date' | translate"
              fieldId="expected_close_date"
            >
              <input
                id="expected_close_date"
                type="date"
                class="input"
                formControlName="expected_close_date"
              />
            </app-form-field>

            <app-form-field [label]="'deals.form.notes' | translate" fieldId="notes">
              <textarea
                id="notes"
                class="input h-24 resize-none"
                formControlName="notes"
                placeholder="Detalles del deal..."
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
                {{ (isEdit() ? 'common.save' : 'deals.form.create') | translate }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class DealFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dealService = inject(DealService);
  private readonly pipelineService = inject(PipelineService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly isEdit = signal(false);
  readonly pageLoading = signal(false);
  readonly saving = signal(false);
  readonly stages = signal<PipelineStage[]>([]);

  private dealId: string | null = null;

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    value: [null as number | null],
    currency: ['USD'],
    stage_id: ['', [Validators.required]],
    expected_close_date: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.dealId = this.route.snapshot.paramMap.get('id');
    this.loadStages();

    if (this.dealId) {
      this.isEdit.set(true);
      this.loadDeal(this.dealId);
    }
  }

  private loadStages(): void {
    this.pipelineService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stages) => this.stages.set(stages.sort((a, b) => a.order - b.order)),
      });
  }

  private loadDeal(id: string): void {
    this.pageLoading.set(true);
    this.dealService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (deal) => {
          this.form.patchValue({
            title: deal.title,
            value: deal.value,
            currency: deal.currency,
            stage_id: deal.stage_id,
            expected_close_date: deal.expected_close_date ?? '',
            notes: deal.notes ?? '',
          });
          this.pageLoading.set(false);
        },
        error: (err: unknown) => {
          this.pageLoading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_deal'));
          this.goBack();
        },
      });
  }

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return this.translate.t('validation.required');
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
      title: value.title!,
      value: value.value,
      currency: value.currency ?? 'USD',
      stage_id: value.stage_id!,
      expected_close_date: value.expected_close_date || null,
      notes: value.notes || null,
    };

    const req = this.isEdit()
      ? this.dealService.update(this.dealId!, payload)
      : this.dealService.create(payload);

    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (deal) => {
        this.toast.success(
          this.isEdit() ? this.translate.t('deals.updated') : this.translate.t('deals.created'),
        );
        this.router.navigate(['/deals', deal.id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorHandler.handle(err, this.translate.t('error.save_deal'));
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/deals']);
  }
}
