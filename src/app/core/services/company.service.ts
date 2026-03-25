import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
import { PaginatedResponse } from '../models/api.model';
import {
  Company,
  CompanyListParams,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../models/company.model';
import { ApiService } from './api.service';

/** Service for companies CRUD operations */
@Injectable({ providedIn: 'root' })
export class CompanyService extends ApiService {
  private readonly path = `${API_VERSION}/companies`;

  /**
   * Returns a paginated list of companies filtered by optional params.
   * @param params Optional filters: search, page, page_size
   */
  list(params: CompanyListParams = {}): Observable<PaginatedResponse<Company>> {
    return this.get<PaginatedResponse<Company>>(this.path, params as Record<string, unknown>);
  }

  /**
   * Fetches a single company by its UUID.
   * @param id Company UUID
   */
  getById(id: string): Observable<Company> {
    return this.get<Company>(`${this.path}/${id}`);
  }

  /**
   * Creates a new company.
   * @param payload Company creation payload
   */
  create(payload: CreateCompanyRequest): Observable<Company> {
    return this.post<Company>(this.path, payload);
  }

  /**
   * Updates an existing company.
   * @param id Company UUID
   * @param payload Updated fields
   */
  update(id: string, payload: UpdateCompanyRequest): Observable<Company> {
    return this.put<Company>(`${this.path}/${id}`, payload);
  }

  /**
   * Deletes a company by UUID.
   * @param id Company UUID
   */
  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
