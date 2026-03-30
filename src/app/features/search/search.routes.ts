import { Routes } from '@angular/router';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./search-home.component').then((m) => m.SearchHomeComponent),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./search-documents.component').then((m) => m.SearchDocumentsComponent),
  },
  {
    path: 'query',
    loadComponent: () =>
      import('./search-query.component').then((m) => m.SearchQueryComponent),
  },
];
