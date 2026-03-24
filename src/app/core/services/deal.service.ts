import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly path = '/api/v1/deals';

  list(params: DealListParams = {}): Observable<PaginatedResponse<Deal>> {
    return this.get<PaginatedResponse<Deal>>(this.path, params as Record<string, unknown>);
  }

  getById(id: string): Observable<Deal> {
    return this.get<Deal>(`${this.path}/${id}`);
  }

  create(payload: CreateDealRequest): Observable<Deal> {
    return this.post<Deal>(this.path, payload);
  }

  update(id: string, payload: UpdateDealRequest): Observable<Deal> {
    return this.put<Deal>(`${this.path}/${id}`, payload);
  }

  move(id: string, payload: MoveDealRequest): Observable<Deal> {
    return this.patch<Deal>(`${this.path}/${id}/stage`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
