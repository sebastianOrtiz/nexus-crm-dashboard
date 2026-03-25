import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
import { PaginatedResponse } from '../models/api.model';
import {
  CreateDealRequest,
  Deal,
  DealListParams,
  MoveDealRequest,
  UpdateDealRequest,
} from '../models/deal.model';
import { ApiService } from './api.service';

/** Service for deals CRUD and pipeline operations */
@Injectable({ providedIn: 'root' })
export class DealService extends ApiService {
  private readonly path = `${API_VERSION}/deals`;

  /**
   * Returns a paginated list of deals filtered by optional params.
   * @param params Optional filters: search, stage_id, status, assigned_to_id, page, page_size
   */
  list(params: DealListParams = {}): Observable<PaginatedResponse<Deal>> {
    return this.get<PaginatedResponse<Deal>>(this.path, params as Record<string, unknown>);
  }

  /**
   * Fetches a single deal by its UUID.
   * @param id Deal UUID
   */
  getById(id: string): Observable<Deal> {
    return this.get<Deal>(`${this.path}/${id}`);
  }

  /**
   * Creates a new deal.
   * @param payload Deal creation payload
   */
  create(payload: CreateDealRequest): Observable<Deal> {
    return this.post<Deal>(this.path, payload);
  }

  /**
   * Updates an existing deal.
   * @param id Deal UUID
   * @param payload Updated fields
   */
  update(id: string, payload: UpdateDealRequest): Observable<Deal> {
    return this.put<Deal>(`${this.path}/${id}`, payload);
  }

  /**
   * Moves a deal to a different pipeline stage.
   * @param id Deal UUID
   * @param payload Target stage ID
   */
  move(id: string, payload: MoveDealRequest): Observable<Deal> {
    return this.patch<Deal>(`${this.path}/${id}/stage`, payload);
  }

  /**
   * Deletes a deal by UUID.
   * @param id Deal UUID
   */
  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
