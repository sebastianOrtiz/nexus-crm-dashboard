import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_PAGE_SIZE } from '../../core/constants';
import { ACTIVITY_TYPES } from '../../core/enums';
import { Activity, ActivityType } from '../../core/models/activity.model';
import { ActivityService } from '../../core/services/activity.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslateService } from '../../core/services/translate.service';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

const TYPE_VARIANT: Record<ActivityType, BadgeVariant> = {
  call: 'info',
  email: 'purple',
  meeting: 'warning',
  note: 'default',
};

interface ActivityGroup {
  date: string;
  activities: Activity[];
}

/** Activities timeline view */
@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    BadgeComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    FormFieldComponent,
    LoadingSpinnerComponent,
    ModalComponent,
    TranslatePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">{{ 'activities.title' | translate }}</h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'activities.subtitle' | translate }}</p>
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
          {{ 'activities.new' | translate }}
        </button>
      </div>

      <!-- Type filter -->
      <div class="flex gap-2 flex-wrap">
        <button
          class="btn-sm rounded-full"
          [class]="
            typeFilter() === ''
              ? 'bg-primary-600 text-white'
              : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
          "
          (click)="setTypeFilter('')"
        >
          {{ 'common.all' | translate }}
        </button>
        @for (type of activityTypes; track type) {
          <button
            class="btn-sm rounded-full"
            [class]="
              typeFilter() === type
                ? 'bg-primary-600 text-white'
                : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
            "
            (click)="setTypeFilter(type)"
          >
            {{ typeLabel(type) }}
          </button>
        }
      </div>

      <!-- Timeline -->
      @if (loading()) {
        <div class="flex justify-center py-20"><app-loading-spinner size="lg" /></div>
      } @else if (activityGroups().length === 0) {
        <app-empty-state
          [title]="'activities.empty_title' | translate"
          [description]="'activities.empty_desc' | translate"
          [actionLabel]="'activities.new' | translate"
          (action)="openCreateModal()"
        />
      } @else {
        <div class="space-y-8">
          @for (group of activityGroups(); track group.date) {
            <div>
              <h3 class="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
                <div class="h-px flex-1 bg-surface-700"></div>
                {{ group.date | date: "EEEE, d 'de' MMMM yyyy" : '' : 'es' }}
                <div class="h-px flex-1 bg-surface-700"></div>
              </h3>

              <div class="space-y-3">
                @for (activity of group.activities; track activity.id) {
                  <div class="card flex items-center gap-4 cursor-pointer hover:border-surface-600 transition-colors" (click)="openEditModal(activity)">
                    <!-- Type icon -->
                    <div class="shrink-0">
                      <app-badge
                        [label]="typeLabel(activity.type)"
                        [variant]="typeVariant(activity.type)"
                      />
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-surface-100">{{ activity.subject }}</p>

                      @if (activity.description) {
                        <p class="text-sm text-surface-400 mt-1 whitespace-pre-line">
                          {{ activity.description }}
                        </p>
                      }

                      <div class="flex items-center gap-3 mt-2 text-xs text-surface-500">
                        @if (activity.contact) {
                          <span>{{ activity.contact.firstName }} {{ activity.contact.lastName }}</span>
                        }
                        @if (activity.dealTitle) {
                          <span>{{ activity.dealTitle }}</span>
                        }
                        @if (activity.createdBy) {
                          <span>{{ 'activities.by' | translate }} {{ activity.createdBy.firstName }} {{ activity.createdBy.lastName }}</span>
                        }
                      </div>
                    </div>

                    <span class="text-xs text-surface-500 shrink-0">{{ activity.createdAt | date: 'HH:mm' }}</span>

                    <div class="flex items-center gap-1 shrink-0">
                      @if (activity.completedAt === null) {
                        <button
                          class="btn-ghost btn-sm p-1.5 text-green-400"
                          [title]="'activities.mark_complete' | translate"
                          (click)="$event.stopPropagation(); completeActivity(activity.id)"
                        >
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      }
                      <button
                        class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                        (click)="$event.stopPropagation(); confirmDelete(activity)"
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
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (hasMore()) {
          <div class="text-center">
            <button class="btn-secondary" (click)="loadMore()" [disabled]="loadingMore()">
              @if (loadingMore()) {
                <app-loading-spinner size="sm" />
              }
              {{ 'common.load_more' | translate }}
            </button>
          </div>
        }
      }
    </div>

    <!-- Create modal -->
    <app-modal
      [isOpen]="showModal()"
      [title]="(editTarget() ? 'activities.edit' : 'activities.new') | translate"
      (close)="showModal.set(false)"
    >
      <form [formGroup]="form" (ngSubmit)="saveActivity()" class="space-y-4">
        <app-form-field
          [label]="'activities.form.type' | translate"
          fieldId="type"
          [required]="true"
        >
          <select id="type" class="input" formControlName="type">
            @for (type of activityTypes; track type) {
              <option [value]="type">{{ typeLabel(type) }}</option>
            }
          </select>
        </app-form-field>

        <app-form-field
          [label]="'activities.form.subject' | translate"
          fieldId="subject"
          [required]="true"
          [error]="
            form.get('subject')?.touched && form.get('subject')?.invalid
              ? ('validation.required_short' | translate)
              : ''
          "
        >
          <input
            id="subject"
            type="text"
            class="input"
            formControlName="subject"
            placeholder="Descripción breve"
          />
        </app-form-field>

        <app-form-field [label]="'activities.form.body' | translate" fieldId="body">
          <textarea
            id="body"
            class="input h-24 resize-none"
            formControlName="body"
            placeholder="Notas adicionales..."
          ></textarea>
        </app-form-field>

        <app-form-field [label]="'activities.form.scheduled' | translate" fieldId="scheduled_at">
          <input
            id="scheduled_at"
            type="datetime-local"
            class="input"
            formControlName="scheduled_at"
          />
        </app-form-field>
      </form>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="showModal.set(false)">
          {{ 'common.cancel' | translate }}
        </button>
        <button
          class="btn-primary"
          (click)="saveActivity()"
          [disabled]="saving() || form.invalid"
        >
          @if (saving()) {
            <app-loading-spinner size="sm" />
          }
          {{ (editTarget() ? 'activities.form.save' : 'activities.form.create') | translate }}
        </button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      [title]="'activities.delete_title' | translate"
      [message]="'activities.delete_msg' | translate"
      (confirm)="deleteActivity()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class ActivitiesComponent implements OnInit {
  private readonly activityService = inject(ActivityService);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly translate = inject(TranslateService);

  readonly activities = signal<Activity[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editTarget = signal<Activity | null>(null);
  readonly showDeleteDialog = signal(false);
  readonly deleteTarget = signal<Activity | null>(null);
  readonly typeFilter = signal<ActivityType | ''>('');
  readonly hasMore = signal(false);

  readonly activityTypes = ACTIVITY_TYPES;

  private currentPage = 1;
  private readonly pageSize = DEFAULT_PAGE_SIZE;

  readonly form = this.fb.group({
    type: ['call' as ActivityType, [Validators.required]],
    subject: ['', [Validators.required]],
    body: [''],
    scheduled_at: [''],
  });

  readonly activityGroups = () => {
    const groups = new Map<string, Activity[]>();
    for (const activity of this.activities()) {
      const date = activity.createdAt.split('T')[0];
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(activity);
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, acts]) => ({ date, activities: acts }) as ActivityGroup);
  };

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    this.currentPage = 1;
    const type = this.typeFilter() || undefined;
    this.activityService
      .list({ activity_type: type, page: 1, page_size: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activities.set(res.items);
          this.hasMore.set(res.page < res.pages);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_activities'));
        },
      });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.currentPage++;
    const type = this.typeFilter() || undefined;
    this.activityService
      .list({ activity_type: type, page: this.currentPage, page_size: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activities.update((prev) => [...prev, ...res.items]);
          this.hasMore.set(res.page < res.pages);
          this.loadingMore.set(false);
        },
        error: (err: unknown) => {
          this.loadingMore.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_more_activities'));
        },
      });
  }

  setTypeFilter(type: ActivityType | ''): void {
    this.typeFilter.set(type);
    this.loadActivities();
  }

  openCreateModal(): void {
    this.editTarget.set(null);
    this.form.reset({ type: 'call' });
    this.showModal.set(true);
  }

  openEditModal(activity: Activity): void {
    this.editTarget.set(activity);
    this.form.patchValue({
      type: activity.type,
      subject: activity.subject,
      body: activity.description ?? '',
      scheduled_at: activity.scheduledAt?.slice(0, 16) ?? '',
    });
    this.showModal.set(true);
  }

  saveActivity(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      type: value.type as ActivityType,
      subject: value.subject!,
      description: value.body || null,
      scheduledAt: value.scheduled_at || null,
    };

    const target = this.editTarget();
    const req = target
      ? this.activityService.update(target.id, payload)
      : this.activityService.create(payload);

    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.showModal.set(false);
        this.saving.set(false);
        this.toast.success(this.translate.t(target ? 'activities.updated' : 'activities.created'));
        this.loadActivities();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorHandler.handle(err, this.translate.t('error.create_activity'));
      },
    });
  }

  completeActivity(id: string): void {
    this.activityService
      .complete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(this.translate.t('activities.completed'));
          this.loadActivities();
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.complete_activity')),
      });
  }

  confirmDelete(activity: Activity): void {
    this.deleteTarget.set(activity);
    this.showDeleteDialog.set(true);
  }

  deleteActivity(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.activityService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.toast.success(this.translate.t('activities.deleted'));
          this.loadActivities();
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.delete_activity')),
      });
  }

  typeLabel(type: ActivityType): string {
    return this.translate.t('activities.type.' + type);
  }

  typeVariant(type: ActivityType): BadgeVariant {
    return TYPE_VARIANT[type];
  }
}
