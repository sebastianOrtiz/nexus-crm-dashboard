import { ActivityType } from '../enums';
import { ContactSummary } from './contact.model';
import { UserSummary } from './user.model';

export type { ActivityType } from '../enums';

/** Activity entity */
export interface Activity {
  id: string;
  organizationId: string;
  type: ActivityType;
  subject: string;
  description: string | null;
  contactId: string | null;
  dealId: string | null;
  userId: string;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  // Expanded relations (not always present from API)
  contact?: ContactSummary | null;
  dealTitle?: string | null;
  createdBy?: UserSummary | null;
}

export interface CreateActivityRequest {
  type: ActivityType;
  subject: string;
  description?: string | null;
  scheduledAt?: string | null;
  contactId?: string | null;
  dealId?: string | null;
}

export interface UpdateActivityRequest extends CreateActivityRequest {
  completedAt?: string | null;
}

export interface ActivityListParams {
  activity_type?: ActivityType;
  contact_id?: string;
  deal_id?: string;
  page?: number;
  page_size?: number;
}
