import { DatePipe, SlicePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OnboardingEvent, OnboardingFlow } from '../../core/models/onboarding.model';
import { EventsService } from '../../core/services/events.service';
import { TranslateService } from '../../core/services/translate.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Events page — onboarding flows and events timeline */
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe, SlicePipe, LoadingSpinnerComponent, ModalComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">{{ 'events.title' | translate }}</h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'events.subtitle' | translate }}</p>
        </div>
        <button
          class="btn btn-secondary flex items-center gap-2"
          (click)="refresh()"
          [disabled]="loading()"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ 'events.refresh' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <!-- Flows section -->
        <div>
          <h2 class="text-lg font-semibold text-surface-200 mb-4">
            {{ 'events.flows' | translate }}
          </h2>
          @if (flows().length === 0) {
            <div class="card text-center py-8">
              <p class="text-sm text-surface-500">{{ 'events.no_flows' | translate }}</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              @for (flow of flows(); track flow.id) {
                <div class="card space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-surface-200">{{ flow.userEmail }}</span>
                    <span
                      class="px-2 py-0.5 text-xs font-medium rounded-full"
                      [class]="statusBadgeClass(flow.status)"
                    >
                      {{ statusLabel(flow.status) }}
                    </span>
                  </div>
                  <div class="space-y-1 text-xs text-surface-400">
                    <div class="flex justify-between">
                      <span>{{ 'events.correlation_id' | translate }}</span>
                      <span class="text-surface-300 font-mono">{{
                        flow.correlationId | slice: 0 : 8
                      }}...</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ 'events.started_at' | translate }}</span>
                      <span class="text-surface-300">{{
                        flow.startedAt | date: 'dd/MM/yyyy HH:mm'
                      }}</span>
                    </div>
                    @if (flow.completedAt) {
                      <div class="flex justify-between">
                        <span>{{ 'events.completed_at' | translate }}</span>
                        <span class="text-surface-300">{{
                          flow.completedAt | date: 'dd/MM/yyyy HH:mm'
                        }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Events timeline section -->
        <div>
          <h2 class="text-lg font-semibold text-surface-200 mb-4">
            {{ 'events.all_events' | translate }}
          </h2>
          @if (events().length === 0) {
            <div class="card text-center py-8">
              <p class="text-sm text-surface-500">{{ 'events.no_events' | translate }}</p>
            </div>
          } @else {
            <div class="card divide-y divide-surface-700">
              @for (event of events(); track event.id) {
                <div class="py-3 first:pt-0 last:pb-0">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-2.5 w-2.5 rounded-full shrink-0"
                      [class]="statusDotClass(event.status)"
                    ></div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-medium text-surface-200">{{ event.eventType }}</span>
                        <span
                          class="px-2 py-0.5 text-xs font-medium rounded-full"
                          [class]="statusBadgeClass(event.status)"
                        >
                          {{ statusLabel(event.status) }}
                        </span>
                      </div>
                      <div class="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
                        <span>{{ event.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
                        @if (event.retryCount > 0) {
                          <span class="text-amber-400">Retries: {{ event.retryCount }}</span>
                        }
                        @if (event.errorMessage) {
                          <span class="text-red-400 truncate">{{ event.errorMessage }}</span>
                        }
                      </div>
                    </div>
                    @if (event.payload) {
                      <button class="btn-secondary btn-sm shrink-0" (click)="showPayload(event)">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Payload
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Payload modal -->
    <app-modal
      [isOpen]="payloadModalOpen()"
      [title]="payloadModalTitle()"
      size="lg"
      (close)="payloadModalOpen.set(false)"
    >
      <pre class="text-xs text-surface-300 bg-surface-700/50 rounded-lg p-4 overflow-x-auto font-mono whitespace-pre-wrap break-all max-h-[60vh]">{{ payloadModalContent() }}</pre>
    </app-modal>
  `,
})
export class EventsComponent implements OnInit {
  private readonly eventsService = inject(EventsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly flows = signal<OnboardingFlow[]>([]);
  readonly events = signal<OnboardingEvent[]>([]);
  readonly payloadModalOpen = signal(false);
  readonly payloadModalTitle = signal('');
  readonly payloadModalContent = signal('');

  ngOnInit(): void {
    this.loadData();
  }

  refresh(): void {
    this.loading.set(true);
    this.loadData();
  }

  statusLabel(status: string): string {
    const key = `events.status.${status}`;
    return this.translate.t(key);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'in_progress':
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-surface-600 text-surface-300';
    }
  }

  statusDotClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-surface-500';
    }
  }

  showPayload(event: OnboardingEvent): void {
    this.payloadModalTitle.set(event.eventType);
    this.payloadModalContent.set(this.formatPayload(event.payload));
    this.payloadModalOpen.set(true);
  }

  formatPayload(payload: unknown): string {
    if (!payload) return '';
    try {
      const obj = typeof payload === 'string' ? JSON.parse(payload) : payload;
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(payload);
    }
  }

  private loadData(): void {
    let pending = 2;
    const done = () => {
      pending--;
      if (pending === 0) this.loading.set(false);
    };

    this.eventsService
      .getFlows()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.flows.set(data);
          done();
        },
        error: () => {
          this.flows.set([]);
          done();
        },
      });

    this.eventsService
      .getAllEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.events.set(data);
          done();
        },
        error: () => {
          this.events.set([]);
          done();
        },
      });
  }
}
