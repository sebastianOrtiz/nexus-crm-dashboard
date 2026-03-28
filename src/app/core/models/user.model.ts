import { UserRole } from './auth.model';

/** CRM User entity (camelCase — matches API response) */
export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
