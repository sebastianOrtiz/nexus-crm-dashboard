import { ContactSummary } from './contact.model';

/** Company entity */
export interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  contacts?: ContactSummary[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  domain?: string | null;
  industry?: string | null;
  size?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {}

export interface CompanyListParams {
  search?: string;
  page?: number;
  page_size?: number;
}
