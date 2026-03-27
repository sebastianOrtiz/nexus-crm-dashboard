import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Top navigation bar with user menu */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <header class="flex items-center h-16 px-6 bg-surface-800 border-b border-surface-700 shrink-0">
      <!-- Mobile menu toggle -->
      <button class="btn-ghost p-2 mr-2 lg:hidden" (click)="toggleSidebar.emit()">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div class="flex-1"></div>

      <!-- Language toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-surface-300 hover:bg-surface-700 hover:text-surface-100 transition-colors mr-2"
        (click)="translate.toggleLang()"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        {{ translate.currentLang() === 'es' ? 'EN' : 'ES' }}
      </button>

      <!-- User menu -->
      <div class="relative">
        <button
          class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-700 transition-colors"
          (click)="userMenuOpen.update((v) => !v)"
        >
          <div
            class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium text-white shrink-0"
          >
            {{ userInitials() }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-medium text-surface-100">{{ userName() }}</p>
            <p class="text-xs text-surface-400">{{ userRole() }}</p>
          </div>
          <svg
            class="h-4 w-4 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        @if (userMenuOpen()) {
          <!-- Backdrop -->
          <div class="fixed inset-0 z-10" (click)="userMenuOpen.set(false)"></div>

          <!-- Dropdown -->
          <div
            class="absolute right-0 mt-1 w-48 bg-surface-700 rounded-lg border border-surface-600 shadow-xl z-20 py-1"
          >
            <a
              routerLink="/settings/profile"
              class="flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-600 hover:text-surface-100 transition-colors"
              (click)="userMenuOpen.set(false)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {{ 'topbar.profile' | translate }}
            </a>
            <a
              routerLink="/settings"
              class="flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-600 hover:text-surface-100 transition-colors"
              (click)="userMenuOpen.set(false)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              </svg>
              {{ 'topbar.settings' | translate }}
            </a>
            <div class="border-t border-surface-600 my-1"></div>
            <button
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-surface-600 transition-colors"
              (click)="logout()"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {{ 'topbar.logout' | translate }}
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class TopbarComponent {
  sidebarCollapsed = input(false);
  toggleSidebar = output<void>();

  private readonly authService = inject(AuthService);
  readonly translate = inject(TranslateService);
  readonly userMenuOpen = signal(false);

  userName(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.name || user.email?.split('@')[0] || '';
  }

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    if (user.name) {
      const parts = user.name.split(' ');
      return (parts[0]?.charAt(0) + (parts[1]?.charAt(0) ?? '')).toUpperCase();
    }
    return user.email?.charAt(0)?.toUpperCase() ?? '?';
  }

  userRole(): string {
    const role = this.authService.userRole();
    return role ? this.translate.t(`role.${role}`) : '';
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
  }
}
