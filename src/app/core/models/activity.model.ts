import { ContactSummary } from './contact.model';
import { UserSummary } from './user.model';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

/** Activity entity */
export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  body: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  is_completed: boolean;
  contact_id: string | null;
  contact: ContactSummary | null;
  deal_id: string | null;
  deal_title: string | null;
  created_by: UserSummary;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityRequest {
  type: ActivityType;
  subject: string;
  body?: string | null;
  scheduled_at?: string | null;
  contact_id?: string | null;
  deal_id?: string | null;
}

export interface UpdateActivityRequest extends CreateActivityRequest {
  is_completed?: boolean;
}

export interface ActivityListParams {
  type?: ActivityType;
  contact_id?: string;
  deal_id?: string;
  is_completed?: boolean;
  page?: number;
  page_size?: number;
}
