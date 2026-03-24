import { ContactSummary } from './contact.model';
import { PipelineStage } from './pipeline.model';
import { UserSummary } from './user.model';

export type DealStatus = 'open' | 'won' | 'lost';

/** Deal entity */
export interface Deal {
  id: string;
  title: string;
  value: number | null;
  currency: string;
  status: DealStatus;
  stage_id: string;
  stage: PipelineStage | null;
  contact_id: string | null;
  contact: ContactSummary | null;
  company_id: string | null;
  company_name: string | null;
  assigned_to: UserSummary | null;
  expected_close_date: string | null;
  notes: string | null;
  stage_history: DealStageHistory[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface DealStageHistory {
  id: string;
  deal_id: string;
  stage_id: string;
  stage_name: string;
  entered_at: string;
  exited_at: string | null;
}

export interface CreateDealRequest {
  title: string;
  value?: number | null;
  currency?: string;
  stage_id: string;
  contact_id?: string | null;
  company_id?: string | null;
  assigned_to_id?: string | null;
  expected_close_date?: string | null;
  notes?: string | null;
}

export interface UpdateDealRequest extends CreateDealRequest {}

export interface MoveDealRequest {
  stage_id: string;
}

export interface DealListParams {
  search?: string;
  stage_id?: string;
  status?: DealStatus;
  assigned_to_id?: string;
  page?: number;
  page_size?: number;
}
