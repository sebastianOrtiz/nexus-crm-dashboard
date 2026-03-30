import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
import { OnboardingEvent, OnboardingFlow } from '../models/onboarding.model';
import { ApiService } from './api.service';

/** Service for event-driven onboarding data */
@Injectable({ providedIn: 'root' })
export class EventsService extends ApiService {
  private readonly path = `${API_VERSION}/events`;

  getFlows(): Observable<OnboardingFlow[]> {
    return this.get<OnboardingFlow[]>(`${this.path}/flows`);
  }

  getAllEvents(): Observable<OnboardingEvent[]> {
    return this.get<OnboardingEvent[]>(`${this.path}/all`);
  }
}
