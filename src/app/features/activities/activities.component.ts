import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_PAGE_SIZE } from '../../core/constants';
import { ACTIVITY_TYPE_LABELS } from '../../core/labels';
import { Activity, ActivityType } from '../../core/models/activity.model';
import { ActivityService } from '../../core/services/activity.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ToastService } from '../../core/services/toast.service';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

const TYPE_VARIANT: Record<ActivityType, BadgeVariant> = {
  call: 'info',
  email: 'purple',
  meeting: 'warning',
  note: 'default',
  task: 'success',
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
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Actividades</h1>
          <p class="text-sm text-surface-400 mt-1">Timeline de interacciones</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva actividad
        </button>
      </div>

      <!-- Type filter -->
      <div class="flex gap-2 flex-wrap">
        <button
          class="btn-sm rounded-full"
          [class]="typeFilter() === '' ? 'bg-primary-600 text-white' : 'bg-surface-700 text-surface-300 hover:bg-surface-600'"
          (click)="setTypeFilter('')"
        >
          Todas
        </button>
        @for (type of activityTypes; track type) {
          <button
            class="btn-sm rounded-full"
            [class]="typeFilter() === type ? 'bg-primary-600 text-white' : 'bg-surface-700 text-surface-300 hover:bg-surface-600'"
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
          title="Sin actividades"
          description="Registra llamadas, emails, reuniones y notas"
          actionLabel="Nueva actividad"
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
                  <div class="card flex items-start gap-4">
                    <!-- Type icon -->
                    <div class="shrink-0 mt-0.5">
                      <app-badge [label]="typeLabel(activity.type)" [variant]="typeVariant(activity.type)" />
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-2">
                        <p class="text-sm font-medium text-surface-100">{{ activity.subject }}</p>
                        <span class="text-xs text-surface-500 shrink-0">
                          {{ activity.created_at | date: 'HH:mm' }}
                        </span>
                      </div>

                      @if (activity.body) {
                        <p class="text-sm text-surface-400 mt-1 whitespace-pre-line">{{ activity.body }}</p>
                      }

                      <div class="flex items-center gap-3 mt-2 text-xs text-surface-500">
                        @if (activity.contact) {
                          <span>{{ activity.contact.first_name }} {{ activity.contact.last_name }}</span>
                        }
                        @if (activity.deal_title) {
                          <span>{{ activity.deal_title }}</span>
                        }
                        <span>por {{ activity.created_by.first_name }} {{ activity.created_by.last_name }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-1 shrink-0">
                      @if (!activity.is_completed) {
                        <button class="btn-ghost btn-sm p-1.5 text-green-400" title="Marcar completada"
                          (click)="completeActivity(activity.id)">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      }
                      <button class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300"
                        (click)="confirmDelete(activity)">
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
              @if (loadingMore()) { <app-loading-spinner size="sm" /> }
              Cargar más
            </button>
          </div>
        }
      }
    </div>

    <!-- Create modal -->
    <app-modal [isOpen]="showCreateModal()" title="Nueva actividad" (close)="showCreateModal.set(false)">
      <form [formGroup]="form" (ngSubmit)="createActivity()" class="space-y-4">
        <app-form-field label="Tipo" fieldId="type" [required]="true">
          <select id="type" class="input" formControlName="type">
            @for (type of activityTypes; track type) {
              <option [value]="type">{{ typeLabel(type) }}</option>
            }
          </select>
        </app-form-field>

        <app-form-field label="Asunto" fieldId="subject" [required]="true" [error]="form.get('subject')?.touched && form.get('subject')?.invalid ? 'Requerido' : ''">
          <input id="subject" type="text" class="input" formControlName="subject" placeholder="Descripción breve" />
        </app-form-field>

        <app-form-field label="Detalle" fieldId="body">
          <textarea id="body" class="input h-24 resize-none" formControlName="body"
            placeholder="Notas adicionales..."></textarea>
        </app-form-field>

        <app-form-field label="Fecha programada" fieldId="scheduled_at">
          <input id="scheduled_at" type="datetime-local" class="input" formControlName="scheduled_at" />
        </app-form-field>
      </form>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="showCreateModal.set(false)">Cancelar</button>
        <button class="btn-primary" (click)="createActivity()" [disabled]="creating() || form.invalid">
          @if (creating()) { <app-loading-spinner size="sm" /> }
          Crear actividad
        </button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      title="Eliminar actividad"
      message="¿Eliminar esta actividad? Esta acción no se puede deshacer."
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

  readonly activities = signal<Activity[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly creating = signal(false);
  readonly showCreateModal = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly deleteTarget = signal<Activity | null>(null);
  readonly typeFilter = signal<ActivityType | ''>('');
  readonly hasMore = signal(false);

  readonly activityTypes: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task'];

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
      const date = activity.created_at.split('T')[0];
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(activity);
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, acts]) => ({ date, activities: acts } as ActivityGroup));
  };

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    this.currentPage = 1;
    const type = this.typeFilter() || undefined;
    this.activityService
      .list({ type, page: 1, page_size: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activities.set(res.items);
          this.hasMore.set(res.page < res.pages);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, 'Error al cargar actividades');
        },
      });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.currentPage++;
    const type = this.typeFilter() || undefined;
    this.activityService
      .list({ type, page: this.currentPage, page_size: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activities.update((prev) => [...prev, ...res.items]);
          this.hasMore.set(res.page < res.pages);
          this.loadingMore.set(false);
        },
        error: (err: unknown) => {
          this.loadingMore.set(false);
          this.errorHandler.handle(err, 'Error al cargar más actividades');
        },
      });
  }

  setTypeFilter(type: ActivityType | ''): void {
    this.typeFilter.set(type);
    this.loadActivities();
  }

  openCreateModal(): void {
    this.form.reset({ type: 'call' });
    this.showCreateModal.set(true);
  }

  createActivity(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    const value = this.form.getRawValue();
    this.activityService
      .create({
        type: value.type as ActivityType,
        subject: value.subject!,
        body: value.body || null,
        scheduled_at: value.scheduled_at || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showCreateModal.set(false);
          this.creating.set(false);
          this.toast.success('Actividad creada');
          this.loadActivities();
        },
        error: (err: unknown) => {
          this.creating.set(false);
          this.errorHandler.handle(err, 'Error al crear la actividad');
        },
      });
  }

  completeActivity(id: string): void {
    this.activityService
      .complete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Actividad completada');
          this.loadActivities();
        },
        error: (err: unknown) => this.errorHandler.handle(err, 'Error al completar la actividad'),
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
          this.toast.success('Actividad eliminada');
          this.loadActivities();
        },
        error: (err: unknown) => this.errorHandler.handle(err, 'Error al eliminar la actividad'),
      });
  }

  typeLabel(type: ActivityType): string {
    return ACTIVITY_TYPE_LABELS[type] ?? type;
  }

  typeVariant(type: ActivityType): BadgeVariant {
    return TYPE_VARIANT[type];
  }
}
