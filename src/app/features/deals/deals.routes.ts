import { Routes } from '@angular/router';

export const DEALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/deals-list.component').then((m) => m.DealsListComponent),
  },
  {
    path: 'kanban',
    loadComponent: () =>
      import('./kanban/deals-kanban.component').then((m) => m.DealsKanbanComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/deal-form.component').then((m) => m.DealFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/deal-detail.component').then((m) => m.DealDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/deal-form.component').then((m) => m.DealFormComponent),
  },
];
