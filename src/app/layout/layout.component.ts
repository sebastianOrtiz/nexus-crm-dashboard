import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
/** Shell layout component: sidebar + topbar + router-outlet */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar desktop: always visible on lg+ -->
      <div class="hidden lg:flex h-full">
        <app-sidebar [collapsed]="sidebarCollapsed()" (toggleCollapse)="toggleSidebar()" />
      </div>

      <!-- Sidebar mobile: overlay when mobileSidebarOpen -->
      @if (mobileSidebarOpen()) {
        <!-- Backdrop -->
        <div
          class="fixed inset-0 z-40 bg-black/60 lg:hidden"
          (click)="mobileSidebarOpen.set(false)"
        ></div>
        <!-- Drawer -->
        <div class="fixed inset-y-0 left-0 z-50 lg:hidden">
          <app-sidebar
            [collapsed]="false"
            (toggleCollapse)="mobileSidebarOpen.set(false)"
            (navLinkClicked)="mobileSidebarOpen.set(false)"
          />
        </div>
      }

      <!-- Main -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <app-topbar [sidebarCollapsed]="sidebarCollapsed()" (toggleSidebar)="onToggleSidebar()" />
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-900">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  readonly authService = inject(AuthService);
  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  onToggleSidebar(): void {
    // On mobile (lg:hidden context) we toggle the overlay; on desktop we collapse
    if (window.innerWidth < 1024) {
      this.mobileSidebarOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }
}
