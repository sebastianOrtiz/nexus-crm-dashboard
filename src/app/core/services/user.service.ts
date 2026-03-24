import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  getProfile(): Observable<User> {
    return this.get<User>('/api/v1/users/me');
  }

  updateProfile(payload: UpdateProfileRequest): Observable<User> {
    return this.put<User>('/api/v1/users/me', payload);
  }

  listUsers(): Observable<User[]> {
    return this.get<User[]>('/api/v1/users');
  }

  inviteUser(payload: InviteUserRequest): Observable<User> {
    return this.post<User>('/api/v1/users/invite', payload);
  }

  updateRole(userId: string, payload: UpdateUserRoleRequest): Observable<User> {
    return this.patch<User>(`/api/v1/users/${userId}/role`, payload);
  }

  deactivateUser(userId: string): Observable<User> {
    return this.patch<User>(`/api/v1/users/${userId}/deactivate`, {});
  }
}
