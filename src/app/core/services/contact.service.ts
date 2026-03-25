import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
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
  private readonly path = `${API_VERSION}/contacts`;

  /**
   * Returns a paginated list of contacts filtered by optional params.
   * @param params Optional filters: search, source, page, page_size
   */
  list(params: ContactListParams = {}): Observable<PaginatedResponse<Contact>> {
    return this.get<PaginatedResponse<Contact>>(this.path, params as Record<string, unknown>);
  }

  /**
   * Fetches a single contact by its UUID.
   * @param id Contact UUID
   */
  getById(id: string): Observable<Contact> {
    return this.get<Contact>(`${this.path}/${id}`);
  }

  /**
   * Creates a new contact.
   * @param payload Contact creation payload
   */
  create(payload: CreateContactRequest): Observable<Contact> {
    return this.post<Contact>(this.path, payload);
  }

  /**
   * Updates an existing contact.
   * @param id Contact UUID
   * @param payload Updated fields
   */
  update(id: string, payload: UpdateContactRequest): Observable<Contact> {
    return this.put<Contact>(`${this.path}/${id}`, payload);
  }

  /**
   * Deletes a contact by UUID.
   * @param id Contact UUID
   */
  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
