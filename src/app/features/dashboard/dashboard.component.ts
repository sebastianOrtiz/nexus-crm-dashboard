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
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';

/** Dashboard overview page with KPIs and charts */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CurrencyPipe, DatePipe, LoadingSpinnerComponent, StatsCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">Dashboard</h1>
        <p class="text-sm text-surface-400 mt-1">Resumen de tu pipeline y actividad reciente</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <app-stats-card
            label="Total Contactos"
            [value]="stats()?.total_contacts?.toString() ?? '0'"
            iconBg="bg-blue-500/20"
          >
            <svg icon class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </app-stats-card>

          <app-stats-card
            label="Total Deals"
            [value]="stats()?.total_deals?.toString() ?? '0'"
            iconBg="bg-purple-500/20"
          >
            <svg icon class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </app-stats-card>

          <app-stats-card
            label="Valor del Pipeline"
            [value]="(stats()?.total_deal_value | currency: (stats()?.currency ?? 'USD')) ?? '$0'"
            iconBg="bg-green-500/20"
          >
            <svg icon class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </app-stats-card>

          <app-stats-card
            label="Tasa de Conversión"
            [value]="(stats()?.conversion_rate?.toFixed(1) ?? '0') + '%'"
            iconBg="bg-yellow-500/20"
          >
            <svg icon class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </app-stats-card>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Revenue chart -->
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">Ingresos por mes</h2>
            @if (revenueChartData()) {
              <canvas baseChart
                [data]="revenueChartData()!"
                [options]="barChartOptions"
                type="bar"
                class="max-h-64"
              ></canvas>
            } @else {
              <div class="h-64 flex items-center justify-center text-surface-500 text-sm">
                Sin datos de ingresos
              </div>
            }
          </div>

          <!-- Pipeline funnel -->
          <div class="card">
            <h2 class="text-base font-semibold text-surface-100 mb-4">Pipeline por etapa</h2>
            @if (funnel().length > 0) {
              <div class="space-y-3">
                @for (item of funnel(); track item.stage_id) {
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-surface-300">{{ item.stage_name }}</span>
                      <span class="text-surface-400">{{ item.deal_count }} deals</span>
                    </div>
                    <div class="h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        [style.width.%]="funnelPercentage(item)"
                        [style.background-color]="item.stage_color"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="h-64 flex items-center justify-center text-surface-500 text-sm">
                Sin datos de pipeline
              </div>
            }
          </div>
        </div>

        <!-- Recent activity -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">Actividad reciente</h2>
          @if (recentActivity().length === 0) {
            <p class="text-sm text-surface-500 text-center py-8">Sin actividad reciente</p>
          } @else {
            <div class="space-y-3">
              @for (item of recentActivity(); track item.id) {
                <div class="flex items-start gap-3 py-2">
                  <div class="h-2 w-2 rounded-full bg-primary-500 mt-2 shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-surface-200">
                      <span class="font-medium">{{ item.created_by_name }}</span>
                      {{ activityLabel(item.type) }}
                      <span class="text-primary-400">{{ item.entity_name }}</span>
                    </p>
                    <p class="text-xs text-surface-500 mt-0.5">
                      {{ item.created_at | date: 'dd/MM/yyyy HH:mm' }}
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
      .subscribe({ next: (data) => { this.stats.set(data); done(); }, error: () => done() });

    this.dashboardService
      .getPipelineFunnel()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => { this.funnel.set(data); done(); }, error: () => done() });

    this.dashboardService
      .getRevenue(6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => { this.buildRevenueChart(data); done(); }, error: () => done() });

    this.dashboardService
      .getRecentActivity(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => { this.recentActivity.set(data); done(); }, error: () => done() });
  }

  private buildRevenueChart(data: RevenueDataPoint[]): void {
    if (!data.length) return;
    this.revenueChartData.set({
      labels: data.map((d) => `${d.month}/${d.year}`),
      datasets: [
        {
          data: data.map((d) => d.revenue),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
          label: 'Ingresos',
        },
      ],
    });
  }

  funnelPercentage(item: PipelineFunnelItem): number {
    const max = Math.max(...this.funnel().map((f) => f.deal_count), 1);
    return (item.deal_count / max) * 100;
  }

  activityLabel(type: string): string {
    const labels: Record<string, string> = {
      call: ' realizó una llamada con ',
      email: ' envió un email a ',
      meeting: ' tuvo una reunión con ',
      note: ' agregó una nota en ',
      task: ' completó una tarea en ',
      deal_created: ' creó el deal ',
      deal_moved: ' movió el deal ',
      contact_created: ' creó el contacto ',
    };
    return labels[type] ?? ' interactuó con ';
  }
}
