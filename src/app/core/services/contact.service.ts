import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/api.model';
import {
  Contact,
  ContactListParams,
  CreateContactRequest,
  UpdateContactRequest,
} from '../models/contact.model';
import { ApiService } from './api.service';

/** Service for contacts CRUD operations */
@Injectable({ providedIn: 'root' })
export class ContactService extends ApiService {
  private readonly path = '/api/v1/contacts';

  list(params: ContactListParams = {}): Observable<PaginatedResponse<Contact>> {
    return this.get<PaginatedResponse<Contact>>(this.path, params as Record<string, unknown>);
  }

  getById(id: string): Observable<Contact> {
    return this.get<Contact>(`${this.path}/${id}`);
  }

  create(payload: CreateContactRequest): Observable<Contact> {
    return this.post<Contact>(this.path, payload);
  }

  update(id: string, payload: UpdateContactRequest): Observable<Contact> {
    return this.put<Contact>(`${this.path}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
