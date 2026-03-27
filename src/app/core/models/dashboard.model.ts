/** Dashboard statistics (maps to API camelCase response) */
export interface DashboardStats {
  openDeals: number;
  totalPipelineValue: number;
  wonDealsThisMonth: number;
  revenueThisMonth: number;
  totalContacts: number;
  totalCompanies: number;
}

/** Deals grouped by pipeline stage */
export interface PipelineFunnelItem {
  stageId: string;
  stageName: string;
  dealCount: number;
  totalValue: number;
}

/** API response wrapper for pipeline */
export interface PipelineStatsResponse {
  stages: PipelineFunnelItem[];
}

/** Monthly revenue data point */
export interface RevenueDataPoint {
  period: string;
  revenue: number;
  dealCount: number;
}

/** API response wrapper for revenue */
export interface RevenueStatsResponse {
  periods: RevenueDataPoint[];
}

/** Recent activity feed item */
export interface RecentActivityItem {
  id: string;
  type: string;
  subject: string;
  userName: string;
  createdAt: string;
}

/** API response wrapper for activity */
export interface ActivityStatsResponse {
  recent: RecentActivityItem[];
  totalThisWeek: number;
}
