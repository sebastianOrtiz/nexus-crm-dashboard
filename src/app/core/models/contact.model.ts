import { ContactSource } from '../enums';
import { UserSummary } from './user.model';

export type { ContactSource } from '../enums';

/** Contact entity */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  companyName: string | null;
  source: ContactSource;
  assignedTo: UserSummary | null;
  tags: string[];
  notes: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  companyId?: string | null;
  source: ContactSource;
  assignedToId?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface UpdateContactRequest extends CreateContactRequest {}

export interface ContactListParams {
  search?: string;
  source?: ContactSource;
  page?: number;
  pageSize?: number;
}
