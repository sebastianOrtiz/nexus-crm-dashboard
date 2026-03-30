import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // App shell (protected)
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./features/contacts/contacts.routes').then((m) => m.CONTACTS_ROUTES),
      },
      {
        path: 'companies',
        loadChildren: () =>
          import('./features/companies/companies.routes').then((m) => m.COMPANIES_ROUTES),
      },
      {
        path: 'deals',
        loadChildren: () => import('./features/deals/deals.routes').then((m) => m.DEALS_ROUTES),
      },
      {
        path: 'activities',
        loadChildren: () =>
          import('./features/activities/activities.routes').then((m) => m.ACTIVITIES_ROUTES),
      },
      {
        path: 'pipeline',
        loadChildren: () =>
          import('./features/pipeline/pipeline.routes').then((m) => m.PIPELINE_ROUTES),
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/events.routes').then((m) => m.EVENTS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
