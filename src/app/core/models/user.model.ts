import { UserRole } from './auth.model';

/** CRM User entity */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  email: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
