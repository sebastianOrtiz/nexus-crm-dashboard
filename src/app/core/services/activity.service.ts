import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
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
  private readonly path = `${API_VERSION}/activities`;

  /**
   * Returns a paginated list of activities filtered by optional params.
   * @param params Optional filters: type, contact_id, deal_id, is_completed, page, page_size
   */
  list(params: ActivityListParams = {}): Observable<PaginatedResponse<Activity>> {
    return this.get<PaginatedResponse<Activity>>(this.path, params as Record<string, unknown>);
  }

  /**
   * Fetches a single activity by its UUID.
   * @param id Activity UUID
   */
  getById(id: string): Observable<Activity> {
    return this.get<Activity>(`${this.path}/${id}`);
  }

  /**
   * Creates a new activity.
   * @param payload Activity creation payload
   */
  create(payload: CreateActivityRequest): Observable<Activity> {
    return this.post<Activity>(this.path, payload);
  }

  /**
   * Updates an existing activity.
   * @param id Activity UUID
   * @param payload Updated fields
   */
  update(id: string, payload: UpdateActivityRequest): Observable<Activity> {
    return this.put<Activity>(`${this.path}/${id}`, payload);
  }

  /**
   * Marks an activity as completed.
   * @param id Activity UUID
   */
  complete(id: string): Observable<Activity> {
    return this.patch<Activity>(`${this.path}/${id}/complete`, {});
  }

  /**
   * Deletes an activity by UUID.
   * @param id Activity UUID
   */
  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
