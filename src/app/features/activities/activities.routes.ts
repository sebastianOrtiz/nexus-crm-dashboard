import { Routes } from '@angular/router';

export const ACTIVITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./activities.component').then((m) => m.ActivitiesComponent),
  },
];
