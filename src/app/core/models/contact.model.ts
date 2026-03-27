import { UserSummary } from './user.model';

export type ContactSource = 'manual' | 'import' | 'website' | 'referral' | 'social' | 'other';

/** Contact entity */
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  company_name: string | null;
  source: ContactSource;
  assigned_to: UserSummary | null;
  tags: string[];
  notes: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  company_id?: string | null;
  source: ContactSource;
  assigned_to_id?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface UpdateContactRequest extends CreateContactRequest {}

export interface ContactListParams {
  search?: string;
  source?: ContactSource;
  page?: number;
  page_size?: number;
}
