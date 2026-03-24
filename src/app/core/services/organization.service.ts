import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, UpdateOrganizationRequest } from '../models/organization.model';
import { ApiService } from './api.service';

/** Service for organization/tenant settings */
@Injectable({ providedIn: 'root' })
export class OrganizationService extends ApiService {
  getOrganization(): Observable<Organization> {
    return this.get<Organization>('/api/v1/organization');
  }

  updateOrganization(payload: UpdateOrganizationRequest): Observable<Organization> {
    return this.put<Organization>('/api/v1/organization', payload);
  }
}
