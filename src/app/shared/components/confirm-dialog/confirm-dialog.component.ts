import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

/** Reusable confirmation dialog */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen()" [title]="title()" size="sm" (close)="cancel.emit()">
      <p class="text-surface-300 text-sm">{{ message() }}</p>

      <div footer class="flex justify-end gap-3">
        <button class="btn-secondary" (click)="cancel.emit()">Cancelar</button>
        <button class="btn-danger" (click)="confirm.emit()">{{ confirmLabel() }}</button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  isOpen = input(false);
  title = input('Confirmar acción');
  message = input('¿Estás seguro de que deseas realizar esta acción?');
  confirmLabel = input('Eliminar');
  confirm = output<void>();
  cancel = output<void>();
}
