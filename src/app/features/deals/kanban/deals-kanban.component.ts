import { CurrencyPipe } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { KANBAN_PAGE_SIZE } from '../../../core/constants';
import { Deal } from '../../../core/models/deal.model';
import { PipelineStage } from '../../../core/models/pipeline.model';
import { DealService } from '../../../core/services/deal.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PipelineService } from '../../../core/services/pipeline.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface KanbanColumn {
  stage: PipelineStage;
  deals: Deal[];
}

/** Kanban board for deals with drag & drop between pipeline stages */
@Component({
  selector: 'app-deals-kanban',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    CurrencyPipe,
    RouterLink,
    BadgeComponent,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">{{ 'kanban.title' | translate }}</h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'kanban.subtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/deals" class="btn-secondary">{{ 'deals.list_view' | translate }}</a>
          <button class="btn-primary" (click)="goToCreate()">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {{ 'deals.new' | translate }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <!-- Kanban board -->
        <div class="flex gap-4 overflow-x-auto pb-4">
          @for (column of columns(); track column.stage.id) {
            <div class="shrink-0 w-72">
              <!-- Column header -->
              <div class="flex items-center justify-between mb-3 px-1">
                <div class="flex items-center gap-2">
                  <div
                    class="h-3 w-3 rounded-full"
                    [style.background-color]="column.stage.color"
                  ></div>
                  <h3 class="font-medium text-surface-200 text-sm">{{ column.stage.name }}</h3>
                  <span class="text-xs text-surface-500 bg-surface-700 rounded-full px-2 py-0.5">
                    {{ column.deals.length }}
                  </span>
                </div>
                @if (columnValue(column) > 0) {
                  <span class="text-xs text-surface-400">
                    {{ columnValue(column) | currency: 'USD' : 'symbol' : '1.0-0' }}
                  </span>
                }
              </div>

              <!-- Drop list -->
              <div
                cdkDropList
                [id]="column.stage.id"
                [cdkDropListData]="column.deals"
                [cdkDropListConnectedTo]="connectedDropLists()"
                class="min-h-[200px] space-y-2 rounded-xl p-2 bg-surface-800/50 border border-surface-700 border-dashed"
                (cdkDropListDropped)="onDrop($event, column)"
              >
                @for (deal of column.deals; track deal.id) {
                  <div
                    cdkDrag
                    class="bg-surface-800 rounded-lg border border-surface-700 p-3 cursor-grab active:cursor-grabbing hover:border-surface-600 transition-colors"
                    [cdkDragData]="deal"
                  >
                    <!-- Deal card -->
                    <a
                      [routerLink]="['/deals', deal.id]"
                      class="block"
                      (click)="$event.stopPropagation()"
                    >
                      <p class="text-sm font-medium text-surface-100 line-clamp-2">
                        {{ deal.title }}
                      </p>

                      @if (deal.value != null) {
                        <p class="text-sm text-green-400 font-medium mt-1">
                          {{ deal.value | currency: deal.currency }}
                        </p>
                      }

                      @if (deal.contact) {
                        <p class="text-xs text-surface-400 mt-2 flex items-center gap-1">
                          <svg
                            class="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {{ deal.contact.first_name }} {{ deal.contact.last_name }}
                        </p>
                      }

                      @if (deal.expected_close_date) {
                        <p class="text-xs text-surface-500 mt-1 flex items-center gap-1">
                          <svg
                            class="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {{ deal.expected_close_date }}
                        </p>
                      }

                      @if (deal.status === 'won') {
                        <app-badge
                          [label]="'kanban.won' | translate"
                          variant="success"
                          class="mt-2 block"
                        />
                      }
                      @if (deal.status === 'lost') {
                        <app-badge
                          [label]="'kanban.lost' | translate"
                          variant="danger"
                          class="mt-2 block"
                        />
                      }
                    </a>

                    <!-- Drag handle placeholder -->
                    <div
                      *cdkDragPlaceholder
                      class="h-24 rounded-lg bg-surface-700 border-2 border-dashed border-surface-600"
                    ></div>
                  </div>
                }

                @if (column.deals.length === 0) {
                  <div class="flex items-center justify-center h-20 text-xs text-surface-600">
                    {{ 'kanban.drag_here' | translate }}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DealsKanbanComponent implements OnInit {
  private readonly dealService = inject(DealService);
  private readonly pipelineService = inject(PipelineService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly columns = signal<KanbanColumn[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadBoard();
  }

  private loadBoard(): void {
    this.loading.set(true);

    this.pipelineService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stages) => {
          const sortedStages = [...stages].sort((a, b) => a.order - b.order);
          this.dealService
            .list({ page_size: KANBAN_PAGE_SIZE })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                const columnMap = new Map<string, KanbanColumn>();
                for (const stage of sortedStages) {
                  columnMap.set(stage.id, { stage, deals: [] });
                }
                for (const deal of res.items) {
                  const col = columnMap.get(deal.stage_id);
                  if (col) col.deals.push(deal);
                }
                this.columns.set(Array.from(columnMap.values()));
                this.loading.set(false);
              },
              error: (err: unknown) => {
                this.loading.set(false);
                this.errorHandler.handle(err, this.translate.t('error.load_deals'));
              },
            });
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorHandler.handle(err, this.translate.t('error.load_pipeline'));
        },
      });
  }

  connectedDropLists(): string[] {
    return this.columns().map((c) => c.stage.id);
  }

  columnValue(column: KanbanColumn): number {
    return column.deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  }

  onDrop(event: CdkDragDrop<Deal[]>, targetColumn: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const deal = event.item.data as Deal;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    this.dealService
      .move(deal.id, { stage_id: targetColumn.stage.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err: unknown) => {
          // Revert on error
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex,
          );
          this.errorHandler.handle(err, this.translate.t('error.move_deal'));
        },
      });
  }

  goToCreate(): void {
    this.router.navigate(['/deals/new']);
  }
}
