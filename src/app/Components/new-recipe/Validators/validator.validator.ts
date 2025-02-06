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

export function customMinLengthValidator(minLength: number = 3): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.trim().length < minLength) {
      return {
        minLength: {
          requiredLength: minLength,
          actualLength: control.value.length,
        },
      };
    }
    return null;
  };
}

export function customMaxLengthValidator(maxLength: number = 40): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.trim().length > maxLength) {
      return {
        maxLength: {
          requiredLength: maxLength,
          actualLength: control.value.length,
        },
      };
    }
    return null;
  };
}
