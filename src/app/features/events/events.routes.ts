import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./events-home.component').then((m) => m.EventsHomeComponent),
  },
  {
    path: 'flows',
    loadComponent: () => import('./events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'timeline',
    loadComponent: () => import('./events.component').then((m) => m.EventsComponent),
  },
];
