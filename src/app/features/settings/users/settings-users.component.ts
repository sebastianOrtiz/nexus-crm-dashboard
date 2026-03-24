import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import { UserRole } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

const ROLE_VARIANT: Record<UserRole, BadgeVariant> = {
  owner: 'purple',
  admin: 'info',
  member: 'default',
};

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Propietario',
  admin: 'Admin',
  member: 'Miembro',
};

/** User management page (admin/owner only) */
@Component({
  selector: 'app-settings-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    ConfirmDialogComponent,
    FormFieldComponent,
    LoadingSpinnerComponent,
    ModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-surface-100">Usuarios</h2>
          <p class="text-sm text-surface-400 mt-1">Gestiona los miembros de tu organización</p>
        </div>
        <button class="btn-primary" (click)="showInviteModal.set(true)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invitar usuario
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10"><app-loading-spinner /></div>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-surface-700">
          <table class="w-full">
            <thead class="bg-surface-800/80 border-b border-surface-700">
              <tr>
                <th class="table-header">Usuario</th>
                <th class="table-header">Rol</th>
                <th class="table-header">Estado</th>
                <th class="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700 bg-surface-800">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-surface-700/50">
                  <td class="table-cell">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-medium text-primary-300 shrink-0">
                        {{ user.first_name.charAt(0) }}{{ user.last_name.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-surface-100">
                          {{ user.first_name }} {{ user.last_name }}
                          @if (user.id === currentUserId()) {
                            <span class="text-xs text-surface-500 ml-1">(tú)</span>
                          }
                        </p>
                        <p class="text-xs text-surface-400">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="table-cell">
                    <app-badge [label]="roleLabel(user.role)" [variant]="roleVariant(user.role)" />
                  </td>
                  <td class="table-cell">
                    <app-badge
                      [label]="user.is_active ? 'Activo' : 'Inactivo'"
                      [variant]="user.is_active ? 'success' : 'danger'"
                    />
                  </td>
                  <td class="table-cell text-right">
                    @if (user.role !== 'owner' && user.id !== currentUserId()) {
                      <div class="flex items-center justify-end gap-1">
                        @if (user.is_active) {
                          <button class="btn-ghost btn-sm text-red-400 hover:text-red-300"
                            (click)="confirmDeactivate(user)">
                            Desactivar
                          </button>
                        }
                      </div>
                    } @else {
                      <span class="text-surface-600 text-xs">—</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Invite modal -->
    <app-modal [isOpen]="showInviteModal()" title="Invitar usuario" size="sm" (close)="showInviteModal.set(false)">
      <form [formGroup]="inviteForm" class="space-y-4">
        <app-form-field label="Email" fieldId="email" [required]="true"
          [error]="inviteForm.get('email')?.touched && inviteForm.get('email')?.invalid ? 'Email inválido' : ''">
          <input id="email" type="email" class="input" formControlName="email" placeholder="usuario@ejemplo.com" />
        </app-form-field>
        <app-form-field label="Rol" fieldId="role">
          <select id="role" class="input" formControlName="role">
            <option value="member">Miembro</option>
            <option value="admin">Admin</option>
          </select>
        </app-form-field>
      </form>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="showInviteModal.set(false)">Cancelar</button>
        <button class="btn-primary" (click)="inviteUser()" [disabled]="inviting() || inviteForm.invalid">
          @if (inviting()) { <app-loading-spinner size="sm" /> }
          Enviar invitación
        </button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [isOpen]="showDeactivateDialog()"
      title="Desactivar usuario"
      [message]="'¿Desactivar a ' + (deactivateTarget()?.first_name ?? '') + ' ' + (deactivateTarget()?.last_name ?? '') + '?'"
      confirmLabel="Desactivar"
      (confirm)="deactivateUser()"
      (cancel)="showDeactivateDialog.set(false)"
    />
  `,
})
export class SettingsUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly inviting = signal(false);
  readonly showInviteModal = signal(false);
  readonly showDeactivateDialog = signal(false);
  readonly deactivateTarget = signal<User | null>(null);

  readonly currentUserId = computed(() => this.authService.currentUser()?.sub ?? null);

  readonly inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['member' as UserRole],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.listUsers().subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  inviteUser(): void {
    if (this.inviteForm.invalid) { this.inviteForm.markAllAsTouched(); return; }
    this.inviting.set(true);
    const v = this.inviteForm.getRawValue();
    this.userService.inviteUser({ email: v.email!, role: v.role as UserRole }).subscribe({
      next: () => { this.showInviteModal.set(false); this.inviting.set(false); this.toast.success('Invitación enviada'); this.loadUsers(); },
      error: () => { this.inviting.set(false); this.toast.error('Error', 'No se pudo enviar la invitación'); },
    });
  }

  confirmDeactivate(user: User): void {
    this.deactivateTarget.set(user);
    this.showDeactivateDialog.set(true);
  }

  deactivateUser(): void {
    const target = this.deactivateTarget();
    if (!target) return;
    this.userService.deactivateUser(target.id).subscribe({
      next: () => { this.showDeactivateDialog.set(false); this.toast.success('Usuario desactivado'); this.loadUsers(); },
      error: () => this.toast.error('Error', 'No se pudo desactivar el usuario'),
    });
  }

  roleLabel(role: UserRole): string { return ROLE_LABELS[role]; }
  roleVariant(role: UserRole): BadgeVariant { return ROLE_VARIANT[role]; }
}
