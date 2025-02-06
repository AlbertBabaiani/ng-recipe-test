import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, characters: number = 50): string {
    if (!value) return '';
    return value.length > characters
      ? value.substring(0, characters) + '...'
      : value;
  }
}
