import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultValue',
  standalone: true,
})
export class DefaultValuePipe implements PipeTransform {
  transform<T>(value: T | null | undefined, fallback = '—'): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return String(value);
  }
}
