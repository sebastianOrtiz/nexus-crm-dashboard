/** Organization / Tenant entity */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationRequest {
  name: string;
}
