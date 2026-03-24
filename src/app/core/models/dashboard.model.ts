/** Dashboard statistics */
export interface DashboardStats {
  total_contacts: number;
  total_deals: number;
  total_deal_value: number;
  conversion_rate: number;
  currency: string;
}

/** Deals grouped by pipeline stage */
export interface PipelineFunnelItem {
  stage_id: string;
  stage_name: string;
  stage_color: string;
  deal_count: number;
  total_value: number;
}

/** Monthly revenue data point */
export interface RevenueDataPoint {
  month: string;
  year: number;
  revenue: number;
  deal_count: number;
}

/** Recent activity feed item */
export interface RecentActivityItem {
  id: string;
  type: string;
  subject: string;
  entity_type: 'contact' | 'deal' | 'company';
  entity_id: string;
  entity_name: string;
  created_by_name: string;
  created_at: string;
}
