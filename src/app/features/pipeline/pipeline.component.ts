import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PipelineStage } from '../../core/models/pipeline.model';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { PipelineService } from '../../core/services/pipeline.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslateService } from '../../core/services/translate.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

const STAGE_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
];

/** Pipeline stages configuration (admin/owner only) */
@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    ReactiveFormsModule,
    BadgeComponent,
    ConfirmDialogComponent,
    FormFieldComponent,
    LoadingSpinnerComponent,
    ModalComponent,
    TranslatePipe,
  ],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">{{ 'pipeline.title' | translate }}</h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'pipeline.subtitle' | translate }}</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ 'pipeline.new_stage' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-loading-spinner size="lg" /></div>
      } @else {
        <p class="text-sm text-surface-400">
          {{ 'pipeline.drag_hint' | translate }}
        </p>

        <div
          cdkDropList
          [cdkDropListData]="stages()"
          (cdkDropListDropped)="onDrop($event)"
          class="space-y-2"
        >
          @for (stage of stages(); track stage.id) {
            <div
              cdkDrag
              class="card flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-surface-600 transition-colors"
            >
              <!-- Drag handle -->
              <svg
                class="h-5 w-5 text-surface-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 8h16M4 16h16"
                />
              </svg>

              <!-- Color dot -->
              <div
                class="h-4 w-4 rounded-full shrink-0"
                [style.background-color]="stage.color"
              ></div>

              <!-- Stage info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-surface-100">{{ stage.name }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-surface-500"
                    >{{ ('pipeline.order' | translate) + ': ' }}{{ stage.order }}</span
                  >
                  @if (stage.isWon) {
                    <app-badge [label]="'pipeline.won' | translate" variant="success" />
                  }
                  @if (stage.isLost) {
                    <app-badge [label]="'pipeline.lost' | translate" variant="danger" />
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0">
                <button class="btn-ghost btn-sm p-1.5" (click)="openEditModal(stage)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                  (click)="confirmDelete(stage)"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div
                *cdkDragPlaceholder
                class="h-16 rounded-xl bg-surface-700 border-2 border-dashed border-surface-600"
              ></div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create/Edit modal -->
    <app-modal
      [isOpen]="showModal()"
      [title]="(editTarget() ? 'pipeline.edit_stage' : 'pipeline.new_stage') | translate"
      (close)="showModal.set(false)"
    >
      <form [formGroup]="form" class="space-y-4">
        <app-form-field
          [label]="'pipeline.form.name' | translate"
          fieldId="name"
          [required]="true"
          [error]="
            form.get('name')?.touched && form.get('name')?.invalid
              ? ('validation.required_short' | translate)
              : ''
          "
        >
          <input
            id="name"
            type="text"
            class="input"
            formControlName="name"
            placeholder="Ej: Propuesta enviada"
          />
        </app-form-field>

        <app-form-field [label]="'pipeline.form.color' | translate" fieldId="color">
          <div class="flex gap-2 flex-wrap">
            @for (color of stageColors; track color) {
              <button
                type="button"
                class="h-8 w-8 rounded-full border-2 transition-all"
                [style.background-color]="color"
                [class.border-white]="form.get('color')?.value === color"
                [class.border-transparent]="form.get('color')?.value !== color"
                (click)="form.get('color')?.setValue(color)"
              ></button>
            }
          </div>
        </app-form-field>

        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-surface-600 bg-surface-800 text-primary-600"
              formControlName="is_won"
            />
            <span class="text-sm text-surface-300">{{ 'pipeline.mark_won' | translate }}</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-surface-600 bg-surface-800 text-primary-600"
              formControlName="is_lost"
            />
            <span class="text-sm text-surface-300">{{ 'pipeline.mark_lost' | translate }}</span>
          </label>
        </div>
      </form>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="showModal.set(false)">
          {{ 'common.cancel' | translate }}
        </button>
        <button class="btn-primary" (click)="saveStage()" [disabled]="saving() || form.invalid">
          @if (saving()) {
            <app-loading-spinner size="sm" />
          }
          {{ (editTarget() ? 'common.save' : 'pipeline.form.create') | translate }}
        </button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      [title]="'pipeline.delete_title' | translate"
      [message]="translate.t('pipeline.delete_msg', { name: deleteTarget()?.name ?? '' })"
      (confirm)="deleteStage()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class PipelineComponent implements OnInit {
  private readonly pipelineService = inject(PipelineService);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly translate = inject(TranslateService);

  readonly stages = signal<PipelineStage[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly editTarget = signal<PipelineStage | null>(null);
  readonly deleteTarget = signal<PipelineStage | null>(null);

  readonly stageColors = STAGE_COLORS;

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    color: [STAGE_COLORS[0]],
    is_won: [false],
    is_lost: [false],
  });

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this.loading.set(true);
    this.pipelineService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stages) => {
          this.stages.set(stages.sort((a, b) => a.order - b.order));
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_pipeline'));
        },
      });
  }

  openCreateModal(): void {
    this.editTarget.set(null);
    this.form.reset({ color: STAGE_COLORS[0], is_won: false, is_lost: false });
    this.showModal.set(true);
  }

  openEditModal(stage: PipelineStage): void {
    this.editTarget.set(stage);
    this.form.patchValue({
      name: stage.name,
      color: stage.color,
      is_won: stage.isWon,
      is_lost: stage.isLost,
    });
    this.showModal.set(true);
  }

  saveStage(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const target = this.editTarget();

    const payload = {
      name: value.name!,
      color: value.color ?? STAGE_COLORS[0],
      isWon: value.is_won ?? false,
      isLost: value.is_lost ?? false,
      order: target ? target.order : this.stages().length + 1,
    };

    const req = target
      ? this.pipelineService.update(target.id, payload)
      : this.pipelineService.create(payload);

    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.showModal.set(false);
        this.saving.set(false);
        this.toast.success(
          target
            ? this.translate.t('pipeline.stage_updated')
            : this.translate.t('pipeline.stage_created'),
        );
        this.loadStages();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorHandler.handle(err, this.translate.t('error.save_stage'));
      },
    });
  }

  onDrop(event: CdkDragDrop<PipelineStage[]>): void {
    const stages = [...this.stages()];
    moveItemInArray(stages, event.previousIndex, event.currentIndex);
    this.stages.set(stages);

    this.pipelineService
      .reorder({ stageIds: stages.map((s) => s.id) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err: unknown) => {
          this.errorHandler.handle(err, this.translate.t('error.reorder_stages'));
          this.loadStages();
        },
      });
  }

  confirmDelete(stage: PipelineStage): void {
    this.deleteTarget.set(stage);
    this.showDeleteDialog.set(true);
  }

  deleteStage(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.pipelineService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.toast.success(this.translate.t('pipeline.stage_deleted'));
          this.loadStages();
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.delete_stage')),
      });
  }
}
