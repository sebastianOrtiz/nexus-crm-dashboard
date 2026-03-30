import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_VERSION } from '../constants';
import { OnboardingEvent, OnboardingFlow } from '../models/onboarding.model';
import { ApiService } from './api.service';

/** Service for event-driven onboarding data */
@Injectable({ providedIn: 'root' })
export class EventsService extends ApiService {
  private readonly path = `${API_VERSION}/events`;

  getFlows(): Observable<OnboardingFlow[]> {
    return this.get<{ flows: OnboardingFlow[] }>(`${this.path}/flows`).pipe(
      map((res) => res.flows ?? []),
    );
  }

  getAllEvents(): Observable<OnboardingEvent[]> {
    return this.get<{ events: OnboardingEvent[] }>(`${this.path}/all`).pipe(
      map((res) => res.events ?? []),
    );
  }
}
