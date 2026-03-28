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
import { BadgeVariant } from '../../shared/components/badge/badge.component';
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

              <div class="space-y-2">
                @for (activity of group.activities; track activity.id) {
                  <div
                    class="card flex items-center gap-4 cursor-pointer hover:border-surface-600 transition-colors"
                    [class.opacity-60]="activity.completedAt !== null"
                    (click)="openEditModal(activity)"
                  >
                    <!-- Type icon -->
                    <div
                      class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      [class]="typeIconBg(activity.type)"
                    >
                      @switch (activity.type) {
                        @case ('call') {
                          <svg class="h-4 w-4" [class]="typeIconColor(activity.type)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        }
                        @case ('email') {
                          <svg class="h-4 w-4" [class]="typeIconColor(activity.type)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        }
                        @case ('meeting') {
                          <svg class="h-4 w-4" [class]="typeIconColor(activity.type)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                        @case ('note') {
                          <svg class="h-4 w-4" [class]="typeIconColor(activity.type)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      }
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-medium text-surface-100 truncate" [class.line-through]="activity.completedAt !== null">
                          {{ activity.subject }}
                        </p>
                        @if (activity.completedAt !== null) {
                          <span class="text-xs text-green-400 bg-green-400/10 rounded px-1.5 py-0.5 shrink-0">
                            ✓
                          </span>
                        }
                      </div>
                      @if (activity.description) {
                        <p class="text-xs text-surface-400 mt-0.5 truncate">{{ activity.description }}</p>
                      }
                    </div>

                    <!-- Time -->
                    <span class="text-xs text-surface-500 shrink-0">{{ activity.createdAt | date: 'HH:mm' }}</span>

                    <!-- Actions -->
                    <div class="flex items-center gap-0.5 shrink-0">
                      @if (activity.completedAt === null) {
                        <button
                          class="btn-ghost btn-sm p-1.5 text-green-400 hover:text-green-300"
                          [title]="'activities.mark_complete' | translate"
                          (click)="$event.stopPropagation(); completeActivity(activity.id)"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      }
                      <button
                        class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                        (click)="$event.stopPropagation(); confirmDelete(activity)"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

  typeIconBg(type: ActivityType): string {
    const map: Record<ActivityType, string> = {
      call: 'bg-blue-500/15',
      email: 'bg-purple-500/15',
      meeting: 'bg-amber-500/15',
      note: 'bg-surface-600/30',
    };
    return map[type];
  }

  typeIconColor(type: ActivityType): string {
    const map: Record<ActivityType, string> = {
      call: 'text-blue-400',
      email: 'text-purple-400',
      meeting: 'text-amber-400',
      note: 'text-surface-300',
    };
    return map[type];
  }
}
