import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRole } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '../../../core/services/translate.service';
import { UserService } from '../../../core/services/user.service';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  owner: 'purple',
  admin: 'info',
  member: 'default',
  sales_rep: 'warning',
  viewer: 'default',
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
    TranslatePipe,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-surface-100">
            {{ 'settings.users.title' | translate }}
          </h2>
          <p class="text-sm text-surface-400 mt-1">{{ 'settings.users.subtitle' | translate }}</p>
        </div>
        <button class="btn-primary" (click)="showInviteModal.set(true)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          {{ 'settings.users.invite' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-10"><app-loading-spinner /></div>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-surface-700">
          <table class="w-full">
            <thead class="bg-surface-800/80 border-b border-surface-700">
              <tr>
                <th class="table-header">{{ 'settings.users.col.user' | translate }}</th>
                <th class="table-header">{{ 'settings.users.col.role' | translate }}</th>
                <th class="table-header">{{ 'settings.users.col.status' | translate }}</th>
                <th class="table-header text-right">
                  {{ 'settings.users.col.actions' | translate }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700 bg-surface-800">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-surface-700/50">
                  <td class="table-cell">
                    <div class="flex items-center gap-3">
                      <div
                        class="h-8 w-8 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-medium text-primary-300 shrink-0"
                      >
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-surface-100">
                          {{ user.firstName }} {{ user.lastName }}
                          @if (user.id === currentUserId()) {
                            <span class="text-xs text-surface-500 ml-1">{{
                              'settings.users.you' | translate
                            }}</span>
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
                      [label]="
                        user.isActive
                          ? ('settings.users.active' | translate)
                          : ('settings.users.inactive' | translate)
                      "
                      [variant]="user.isActive ? 'success' : 'danger'"
                    />
                  </td>
                  <td class="table-cell text-right">
                    @if (user.role !== 'owner' && user.id !== currentUserId()) {
                      <div class="flex items-center justify-end gap-1">
                        @if (user.isActive) {
                          <button
                            class="btn-ghost btn-sm text-red-400 hover:text-red-300"
                            (click)="confirmDeactivate(user)"
                          >
                            {{ 'settings.users.deactivate' | translate }}
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
    <app-modal
      [isOpen]="showInviteModal()"
      [title]="'settings.users.invite_title' | translate"
      size="sm"
      (close)="showInviteModal.set(false)"
    >
      <form [formGroup]="inviteForm" class="space-y-4">
        <app-form-field
          [label]="'auth.email' | translate"
          fieldId="email"
          [required]="true"
          [error]="
            inviteForm.get('email')?.touched && inviteForm.get('email')?.invalid
              ? ('validation.email_invalid_short' | translate)
              : ''
          "
        >
          <input
            id="email"
            type="email"
            class="input"
            formControlName="email"
            placeholder="usuario@ejemplo.com"
          />
        </app-form-field>
        <app-form-field [label]="'settings.users.col.role' | translate" fieldId="role">
          <select id="role" class="input" formControlName="role">
            <option value="member">{{ 'settings.users.role.member' | translate }}</option>
            <option value="admin">{{ 'settings.users.role.admin' | translate }}</option>
          </select>
        </app-form-field>
      </form>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="showInviteModal.set(false)">
          {{ 'common.cancel' | translate }}
        </button>
        <button
          class="btn-primary"
          (click)="inviteUser()"
          [disabled]="inviting() || inviteForm.invalid"
        >
          @if (inviting()) {
            <app-loading-spinner size="sm" />
          }
          {{ 'settings.users.send_invite' | translate }}
        </button>
      </div>
    </app-modal>

    <app-confirm-dialog
      [isOpen]="showDeactivateDialog()"
      [title]="'settings.users.deactivate_title' | translate"
      [message]="
        translate.t('settings.users.deactivate_msg', {
          name: (deactivateTarget()?.firstName ?? '') + ' ' + (deactivateTarget()?.lastName ?? ''),
        })
      "
      [confirmLabel]="'settings.users.deactivate' | translate"
      (confirm)="deactivateUser()"
      (cancel)="showDeactivateDialog.set(false)"
    />
  `,
})
export class SettingsUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly translate = inject(TranslateService);

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
    this.userService
      .listUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  inviteUser(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    this.inviting.set(true);
    const v = this.inviteForm.getRawValue();
    this.userService
      .inviteUser({ email: v.email!, role: v.role as UserRole })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showInviteModal.set(false);
          this.inviting.set(false);
          this.toast.success(this.translate.t('settings.users.invited'));
          this.loadUsers();
        },
        error: (err: unknown) => {
          this.inviting.set(false);
          this.errorHandler.handle(err, this.translate.t('error.invite_user'));
        },
      });
  }

  confirmDeactivate(user: User): void {
    this.deactivateTarget.set(user);
    this.showDeactivateDialog.set(true);
  }

  deactivateUser(): void {
    const target = this.deactivateTarget();
    if (!target) return;
    this.userService
      .deactivateUser(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeactivateDialog.set(false);
          this.toast.success(this.translate.t('settings.users.deactivated'));
          this.loadUsers();
        },
        error: (err: unknown) =>
          this.errorHandler.handle(err, this.translate.t('error.deactivate_user')),
      });
  }

  roleLabel(role: UserRole): string {
    return this.translate.t('role.' + role);
  }

  roleVariant(role: UserRole): BadgeVariant {
    return ROLE_VARIANT[role] ?? 'default';
  }
}
