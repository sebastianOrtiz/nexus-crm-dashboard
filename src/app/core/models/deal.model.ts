import { DealStatus } from '../enums';
import { ContactSummary } from './contact.model';
import { UserSummary } from './user.model';

export type { DealStatus } from '../enums';

/** Deal entity (matches API DealResponse) */
export interface Deal {
  id: string;
  organizationId: string;
  title: string;
  value: number | null;
  currency: string;
  status: DealStatus;
  stageId: string;
  stageName: string;
  contactId: string | null;
  companyId: string | null;
  assignedToId: string | null;
  expectedClose: string | null;
  closedAt: string | null;
  notes?: string | null;
  stageHistory?: DealStageHistory[];
  createdAt: string;
  updatedAt: string;
  // Expanded relations (not always present)
  stage?: { name: string } | null;
  contact?: ContactSummary | null;
  companyName?: string | null;
  assignedTo?: UserSummary | null;
  // Alias used by some templates
  expectedCloseDate?: string | null;
}

export interface DealStageHistory {
  id: string;
  stageId: string;
  stageName: string;
  movedByName: string;
  enteredAt: string;
  exitedAt: string | null;
}

export interface CreateDealRequest {
  title: string;
  value?: number | null;
  currency?: string;
  stageId: string;
  contactId?: string | null;
  companyId?: string | null;
  assignedToId?: string | null;
  expectedClose?: string | null;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {}

export interface MoveDealRequest {
  stageId: string;
}

export interface DealListParams {
  status?: DealStatus;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  page?: number;
  pageSize?: number;
}
