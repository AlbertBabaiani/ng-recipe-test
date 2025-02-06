import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [],
  templateUrl: './validation-message.component.html',
  styleUrl: './validation-message.component.scss',
})
export class ValidationMessageComponent {
  control = input.required<AbstractControl | null>();
  formName = input<string>('');

  get errorMessage() {
    if (this.control()?.hasError('required'))
      return `* ${this.formName()} is required.`;

    if (this.control()?.hasError('minLength'))
      return `* Enter at least ${
        this.control()?.errors?.['minLength']?.requiredLength
      } characters.`;

    if (this.control()?.hasError('maxLength'))
      return `* The maximum allowed character limit is ${
        this.control()?.errors?.['maxLength']?.requiredLength
      }`;

    if (this.control()?.hasError('invalidUrl')) return '* Enter a valid URL.';

    return '';
  }
}
