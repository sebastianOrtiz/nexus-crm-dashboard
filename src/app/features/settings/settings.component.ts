import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Settings shell with sub-navigation */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-100">{{ 'settings.title' | translate }}</h1>
        <p class="text-sm text-surface-400 mt-1">{{ 'settings.subtitle' | translate }}</p>
      </div>

      <div class="flex gap-6 flex-col lg:flex-row">
        <!-- Side nav -->
        <nav class="flex flex-col sm:flex-row lg:flex-col gap-1 lg:w-48 shrink-0">
          <a routerLink="profile" routerLinkActive="active" class="sidebar-link">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {{ 'settings.profile' | translate }}
          </a>
          @if (isAdminOrOwner()) {
            <a routerLink="organization" routerLinkActive="active" class="sidebar-link">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                />
              </svg>
              {{ 'settings.organization' | translate }}
            </a>
            <a routerLink="users" routerLinkActive="active" class="sidebar-link">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {{ 'settings.users' | translate }}
            </a>
          }
        </nav>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);

  isAdminOrOwner(): boolean {
    return this.authService.isAdminOrOwner();
  }
}
