import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
import { Organization, UpdateOrganizationRequest } from '../models/organization.model';
import { ApiService } from './api.service';

/** Service for organization/tenant settings */
@Injectable({ providedIn: 'root' })
export class OrganizationService extends ApiService {
  /**
   * Fetches the current tenant's organization profile.
   */
  getOrganization(): Observable<Organization> {
    return this.get<Organization>(`${API_VERSION}/organization`);
  }

  /**
   * Updates the current tenant's organization settings.
   * @param payload Organization fields to update
   */
  updateOrganization(payload: UpdateOrganizationRequest): Observable<Organization> {
    return this.put<Organization>(`${API_VERSION}/organization`, payload);
  }
}
