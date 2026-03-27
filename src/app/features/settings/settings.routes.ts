import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.component').then((m) => m.SettingsComponent),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/settings-profile.component').then((m) => m.SettingsProfileComponent),
      },
      {
        path: 'organization',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./organization/settings-organization.component').then(
            (m) => m.SettingsOrganizationComponent,
          ),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./users/settings-users.component').then((m) => m.SettingsUsersComponent),
      },
    ],
  },
];
