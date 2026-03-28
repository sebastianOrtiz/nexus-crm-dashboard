import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_VERSION } from '../constants';
import { PaginatedResponse } from '../models/api.model';
import {
  InviteUserRequest,
  UpdateProfileRequest,
  UpdateUserRoleRequest,
  User,
} from '../models/user.model';
import { ApiService } from './api.service';

/** Service for user management and profile operations */
@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  /**
   * Fetches the current authenticated user's profile.
   */
  getProfile(): Observable<User> {
    return this.get<User>(`${API_VERSION}/users/me`);
  }

  /**
   * Updates the current user's profile information.
   * @param payload Fields to update: first_name, last_name, email
   */
  updateProfile(payload: UpdateProfileRequest): Observable<User> {
    return this.put<User>(`${API_VERSION}/users/me`, payload);
  }

  /**
   * Returns all users belonging to the current tenant.
   * Requires admin or owner role.
   */
  listUsers(): Observable<User[]> {
    return this.get<PaginatedResponse<User>>(`${API_VERSION}/users`).pipe(
      map((res) => res.items),
    );
  }

  /**
   * Sends an invitation email to a new user.
   * @param payload Invitee email and desired role
   */
  inviteUser(payload: InviteUserRequest): Observable<User> {
    return this.post<User>(`${API_VERSION}/users/invite`, payload);
  }

  /**
   * Updates a user's role.
   * @param userId Target user UUID
   * @param payload New role
   */
  updateRole(userId: string, payload: UpdateUserRoleRequest): Observable<User> {
    return this.patch<User>(`${API_VERSION}/users/${userId}/role`, payload);
  }

  /**
   * Deactivates a user account (soft delete).
   * @param userId Target user UUID
   */
  deactivateUser(userId: string): Observable<User> {
    return this.patch<User>(`${API_VERSION}/users/${userId}/deactivate`, {});
  }
}
