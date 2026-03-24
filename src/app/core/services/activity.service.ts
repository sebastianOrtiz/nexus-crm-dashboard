import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Activity,
  ActivityListParams,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '../models/activity.model';
import { PaginatedResponse } from '../models/api.model';
import { ApiService } from './api.service';

/** Service for activities CRUD operations */
@Injectable({ providedIn: 'root' })
export class ActivityService extends ApiService {
  private readonly path = '/api/v1/activities';

  list(params: ActivityListParams = {}): Observable<PaginatedResponse<Activity>> {
    return this.get<PaginatedResponse<Activity>>(this.path, params as Record<string, unknown>);
  }

  getById(id: string): Observable<Activity> {
    return this.get<Activity>(`${this.path}/${id}`);
  }

  create(payload: CreateActivityRequest): Observable<Activity> {
    return this.post<Activity>(this.path, payload);
  }

  update(id: string, payload: UpdateActivityRequest): Observable<Activity> {
    return this.put<Activity>(`${this.path}/${id}`, payload);
  }

  complete(id: string): Observable<Activity> {
    return this.patch<Activity>(`${this.path}/${id}/complete`, {});
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
