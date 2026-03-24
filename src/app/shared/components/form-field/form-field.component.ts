import { Component, input } from '@angular/core';

/** Form field wrapper with label and error message display */
@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="space-y-1">
      @if (label()) {
        <label [for]="fieldId()" class="label">
          {{ label() }}
          @if (required()) {
            <span class="text-red-400 ml-0.5">*</span>
          }
        </label>
      }
      <ng-content />
      @if (error()) {
        <p class="text-xs text-red-400 mt-1">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="text-xs text-surface-500 mt-1">{{ hint() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  label = input('');
  fieldId = input('');
  required = input(false);
  error = input('');
  hint = input('');
}
