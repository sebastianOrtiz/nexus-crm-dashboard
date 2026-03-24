import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DashboardStats,
  PipelineFunnelItem,
  RecentActivityItem,
  RevenueDataPoint,
} from '../models/dashboard.model';
import { ApiService } from './api.service';

/** Service for dashboard statistics and charts data */
@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  private readonly path = '/api/v1/dashboard';

  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>(`${this.path}/stats`);
  }

  getPipelineFunnel(): Observable<PipelineFunnelItem[]> {
    return this.get<PipelineFunnelItem[]>(`${this.path}/pipeline-funnel`);
  }

  getRevenue(months?: number): Observable<RevenueDataPoint[]> {
    return this.get<RevenueDataPoint[]>(`${this.path}/revenue`, months ? { months } : undefined);
  }

  getRecentActivity(limit?: number): Observable<RecentActivityItem[]> {
    return this.get<RecentActivityItem[]>(
      `${this.path}/recent-activity`,
      limit ? { limit } : undefined,
    );
  }
}
