import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface NavItem {
  labelKey: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: 'dashboard' },
  { labelKey: 'nav.contacts', path: '/contacts', icon: 'contacts' },
  { labelKey: 'nav.companies', path: '/companies', icon: 'companies' },
  { labelKey: 'nav.deals', path: '/deals', icon: 'deals' },
  { labelKey: 'nav.activities', path: '/activities', icon: 'activities' },
  { labelKey: 'nav.pipeline', path: '/pipeline', icon: 'pipeline', adminOnly: true },
  { labelKey: 'nav.settings', path: '/settings', icon: 'settings' },
  {
    labelKey: 'events.title',
    path: '/events',
    icon: 'events',
    section: 'nav.section.events',
  },
  {
    labelKey: 'search.title',
    path: '/search',
    icon: 'search',
    section: 'nav.section.search',
  },
];

/** Collapsible sidebar navigation */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <aside
      class="flex flex-col h-full bg-surface-800 border-r border-surface-700 transition-all duration-300 shrink-0"
      [class]="collapsed() ? 'w-16' : 'w-64'"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-surface-700 shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="h-8 w-8 flex items-center justify-center shrink-0">
            <img src="logo.png" alt="NexusCRM" class="h-8 w-auto object-contain" />
          </div>
          @if (!collapsed()) {
            <span class="font-bold text-surface-100 whitespace-nowrap">NexusCRM</span>
          }
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        @for (item of visibleNavItems(); track item.path) {
          @if (item.section) {
            <div class="pt-4 pb-1 px-3">
              @if (!collapsed()) {
                <span class="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                  {{ item.section | translate }}
                </span>
              } @else {
                <div class="border-t border-surface-600"></div>
              }
            </div>
          }
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            class="sidebar-link"
            [title]="collapsed() ? (item.labelKey | translate) : ''"
            (click)="navLinkClicked.emit()"
          >
            <span class="shrink-0">
              @switch (item.icon) {
                @case ('dashboard') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                }
                @case ('contacts') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                @case ('companies') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
                @case ('deals') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
                @case ('activities') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                }
                @case ('pipeline') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                }
                @case ('events') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                @case ('search') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                @case ('settings') {
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              }
            </span>
            @if (!collapsed()) {
              <span class="whitespace-nowrap">{{ item.labelKey | translate }}</span>
            }
          </a>
        }
      </nav>

      <!-- Collapse toggle -->
      <div class="border-t border-surface-700 p-2">
        <button class="sidebar-link w-full justify-center" (click)="toggleCollapse.emit()">
          @if (collapsed()) {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          } @else {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  collapsed = input(false);
  toggleCollapse = output<void>();
  navLinkClicked = output<void>();

  private readonly authService = inject(AuthService);

  visibleNavItems(): NavItem[] {
    return NAV_ITEMS.filter((item) => !item.adminOnly || this.authService.isAdminOrOwner());
  }
}
