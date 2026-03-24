import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly path = '/api/v1/companies';

  list(params: CompanyListParams = {}): Observable<PaginatedResponse<Company>> {
    return this.get<PaginatedResponse<Company>>(this.path, params as Record<string, unknown>);
  }

  getById(id: string): Observable<Company> {
    return this.get<Company>(`${this.path}/${id}`);
  }

  create(payload: CreateCompanyRequest): Observable<Company> {
    return this.post<Company>(this.path, payload);
  }

  update(id: string, payload: UpdateCompanyRequest): Observable<Company> {
    return this.put<Company>(`${this.path}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
