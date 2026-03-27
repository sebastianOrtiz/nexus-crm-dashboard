import { Component, inject, input, output } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ModalComponent } from '../modal/modal.component';

/** Reusable confirmation dialog */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, TranslatePipe],
  template: `
    <app-modal [isOpen]="isOpen()" [title]="title()" size="sm" (close)="cancel.emit()">
      <p class="text-surface-300 text-sm">{{ message() }}</p>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="cancel.emit()">
          {{ 'common.cancel' | translate }}
        </button>
        <button class="btn-danger" (click)="confirm.emit()">{{ confirmLabel() }}</button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  private readonly translate = inject(TranslateService);

  isOpen = input(false);
  title = input(this.translate.t('common.confirm_action'));
  message = input(this.translate.t('common.confirm_default_msg'));
  confirmLabel = input(this.translate.t('common.delete'));
  confirm = output<void>();
  cancel = output<void>();
}
