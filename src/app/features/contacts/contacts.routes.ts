import { Routes } from '@angular/router';

export const CONTACTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/contacts-list.component').then((m) => m.ContactsListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/contact-form.component').then((m) => m.ContactFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/contact-detail.component').then((m) => m.ContactDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/contact-form.component').then((m) => m.ContactFormComponent),
  },
];
