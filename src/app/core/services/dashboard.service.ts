import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_VERSION } from '../constants';
import {
  ActivityStatsResponse,
  DashboardStats,
  PipelineFunnelItem,
  PipelineStatsResponse,
  RecentActivityItem,
  RevenueDataPoint,
  RevenueStatsResponse,
} from '../models/dashboard.model';
import { ApiService } from './api.service';

/** Service for dashboard statistics and charts data */
@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  private readonly path = `${API_VERSION}/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>(`${this.path}/stats`);
  }

  getPipelineFunnel(): Observable<PipelineFunnelItem[]> {
    return this.get<PipelineStatsResponse>(`${this.path}/pipeline`).pipe(map((res) => res.stages));
  }

  getRevenue(months?: number): Observable<RevenueDataPoint[]> {
    return this.get<RevenueStatsResponse>(
      `${this.path}/revenue`,
      months ? { months } : undefined,
    ).pipe(map((res) => res.periods));
  }

  getRecentActivity(limit?: number): Observable<RecentActivityItem[]> {
    return this.get<ActivityStatsResponse>(
      `${this.path}/activity`,
      limit ? { limit } : undefined,
    ).pipe(map((res) => res.recent));
  }
}
