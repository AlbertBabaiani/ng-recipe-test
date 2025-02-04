import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function urlValidator(): ValidatorFn {
  const urlPattern = /^https:\/\/[^.\s]+(\.[^.\s]+)+/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value && !urlPattern.test(value)) {
      return { invalidUrl: true };
    }
    return null;
  };
}

export function nonEmptyStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.trim().length === 0) {
      return { nonEmptyString: true };
    }
    return null;
  };
}
