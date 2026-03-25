import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
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
  private readonly path = `${API_VERSION}/dashboard`;

  /**
   * Returns aggregated KPI stats for the current tenant.
   */
  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>(`${this.path}/stats`);
  }

  /**
   * Returns pipeline funnel data grouped by stage.
   */
  getPipelineFunnel(): Observable<PipelineFunnelItem[]> {
    return this.get<PipelineFunnelItem[]>(`${this.path}/pipeline-funnel`);
  }

  /**
   * Returns monthly revenue data points.
   * @param months Number of past months to include (default defined by API)
   */
  getRevenue(months?: number): Observable<RevenueDataPoint[]> {
    return this.get<RevenueDataPoint[]>(`${this.path}/revenue`, months ? { months } : undefined);
  }

  /**
   * Returns a list of recent activity feed items.
   * @param limit Maximum number of items to return
   */
  getRecentActivity(limit?: number): Observable<RecentActivityItem[]> {
    return this.get<RecentActivityItem[]>(
      `${this.path}/recent-activity`,
      limit ? { limit } : undefined,
    );
  }
}
