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
      <!-- Sidebar -->
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggleCollapse)="toggleSidebar()" />

      <!-- Main -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <app-topbar [sidebarCollapsed]="sidebarCollapsed()" (toggleSidebar)="toggleSidebar()" />
        <main class="flex-1 overflow-y-auto p-6 bg-surface-900">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  readonly authService = inject(AuthService);
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
