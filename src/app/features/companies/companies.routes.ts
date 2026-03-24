import { Routes } from '@angular/router';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/companies-list.component').then((m) => m.CompaniesListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/company-form.component').then((m) => m.CompanyFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/company-detail.component').then((m) => m.CompanyDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/company-form.component').then((m) => m.CompanyFormComponent),
  },
];
