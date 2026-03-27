import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  DashboardStats,
  PipelineFunnelItem,
  RecentActivityItem,
  RevenueDataPoint,
} from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslateService } from '../../core/services/translate.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Dashboard overview page with KPIs and charts */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BaseChartDirective,
    CurrencyPipe,
    DatePipe,
    LoadingSpinnerComponent,
    StatsCardComponent,
    TranslatePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">{{ 'dashboard.title' | translate }}</h1>
        <p class="text-sm text-surface-400 mt-1">{{ 'dashboard.subtitle' | translate }}</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <app-stats-card
            [label]="'dashboard.total_contacts' | translate"
            [value]="stats()?.totalContacts?.toString() ?? '0'"
            iconBg="bg-blue-500/20"
          >
            <svg
              icon
              class="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </app-stats-card>

          <app-stats-card
            [label]="'dashboard.total_deals' | translate"
            [value]="stats()?.openDeals?.toString() ?? '0'"
            iconBg="bg-purple-500/20"
          >
            <svg
              icon
              class="h-5 w-5 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </app-stats-card>

          <app-stats-card
            [label]="'dashboard.pipeline_value' | translate"
            [value]="(stats()?.totalPipelineValue | currency: 'USD') ?? '$0'"
            iconBg="bg-green-500/20"
          >
            <svg
              icon
              class="h-5 w-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </app-stats-card>

          <app-stats-card
            [label]="'dashboard.won_deals' | translate"
            [value]="stats()?.wonDealsThisMonth?.toString() ?? '0'"
            iconBg="bg-yellow-500/20"
          >
            <svg
              icon
              class="h-5 w-5 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </app-stats-card>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Revenue chart -->
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">
              {{ 'dashboard.revenue_chart' | translate }}
            </h2>
            @if (revenueChartData()) {
              <canvas
                baseChart
                [data]="revenueChartData()!"
                [options]="barChartOptions"
                type="bar"
                class="max-h-64"
              ></canvas>
            } @else {
              <div class="h-64 flex items-center justify-center text-surface-500 text-sm">
                {{ 'dashboard.no_revenue' | translate }}
              </div>
            }
          </div>

          <!-- Pipeline funnel -->
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">
              {{ 'dashboard.pipeline_chart' | translate }}
            </h2>
            @if (funnel().length > 0) {
              <div class="space-y-3">
                @for (item of funnel(); track item.stageId) {
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-surface-300">{{ item.stageName }}</span>
                      <span class="text-surface-400">{{
                        translate.t('dashboard.deals_count', { count: item.dealCount })
                      }}</span>
                    </div>
                    <div class="h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all bg-primary-500"
                        [style.width.%]="funnelPercentage(item)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="h-64 flex items-center justify-center text-surface-500 text-sm">
                {{ 'dashboard.no_pipeline' | translate }}
              </div>
            }
          </div>
        </div>

        <!-- Recent activity -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">
            {{ 'dashboard.recent_activity' | translate }}
          </h2>
          @if (recentActivity().length === 0) {
            <p class="text-sm text-surface-500 text-center py-8">
              {{ 'dashboard.no_activity' | translate }}
            </p>
          } @else {
            <div class="space-y-3">
              @for (item of recentActivity(); track item.id) {
                <div class="flex items-start gap-3 py-2">
                  <div class="h-2 w-2 rounded-full bg-primary-500 mt-2 shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-surface-200">
                      <span class="font-medium">{{ item.userName }}</span>
                      {{ activityLabel(item.type) }}
                      <span class="text-primary-400">{{ item.subject }}</span>
                    </p>
                    <p class="text-xs text-surface-500 mt-0.5">
                      {{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly funnel = signal<PipelineFunnelItem[]>([]);
  readonly recentActivity = signal<RecentActivityItem[]>([]);
  readonly revenueChartData = signal<ChartData<'bar'> | null>(null);

  readonly barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
  };

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    let pending = 4;
    const done = () => {
      pending--;
      if (pending === 0) this.loading.set(false);
    };

    this.dashboardService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          done();
        },
        error: () => done(),
      });

    this.dashboardService
      .getPipelineFunnel()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.funnel.set(data);
          done();
        },
        error: () => done(),
      });

    this.dashboardService
      .getRevenue(6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.buildRevenueChart(data);
          done();
        },
        error: () => done(),
      });

    this.dashboardService
      .getRecentActivity(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.recentActivity.set(data);
          done();
        },
        error: () => done(),
      });
  }

  private buildRevenueChart(data: RevenueDataPoint[]): void {
    if (!data.length) return;
    this.revenueChartData.set({
      labels: data.map((d) => d.period),
      datasets: [
        {
          data: data.map((d) => d.revenue),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
          label: this.translate.t('dashboard.revenue_label'),
        },
      ],
    });
  }

  funnelPercentage(item: PipelineFunnelItem): number {
    const max = Math.max(...this.funnel().map((f) => f.dealCount), 1);
    return (item.dealCount / max) * 100;
  }

  activityLabel(type: string): string {
    const labels: Record<string, string> = {
      call: this.translate.t('dashboard.activity.call'),
      email: this.translate.t('dashboard.activity.email'),
      meeting: this.translate.t('dashboard.activity.meeting'),
      note: this.translate.t('dashboard.activity.note'),
      task: this.translate.t('dashboard.activity.task'),
      deal_created: this.translate.t('dashboard.activity.deal_created'),
      deal_moved: this.translate.t('dashboard.activity.deal_moved'),
      contact_created: this.translate.t('dashboard.activity.contact_created'),
    };
    return labels[type] ?? this.translate.t('dashboard.activity.default');
  }
}
