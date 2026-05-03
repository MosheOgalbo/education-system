/**
 * מסך שגיאה: כותרת, אייקון והנחיה לפי סוג הבעיה (רשת / שרת / 404).
 * משתמש ב-`http-error.mapper` לעקביות עם הטוסטים.
 */
import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import type { ApiError } from '../../../core/models/api-error.model';
import {
  errorPresentationVariant,
  errorStateHint,
  errorStateTitle,
} from '../../../core/utils/http-error.mapper';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, MatIconModule, MatButtonModule],
  template: `
    <div
      class="error-state"
      [ngClass]="{
        'error-state--network': view().variant === 'network',
        'error-state--server': view().variant === 'server',
        'error-state--notfound': view().variant === 'notfound',
      }"
      role="alert"
    >
      <mat-icon class="error-state__icon" aria-hidden="true">{{ view().icon }}</mat-icon>
      <h3 class="error-state__title">{{ view().title }}</h3>
      <p class="error-state__message">{{ view().body }}</p>
      @if (view().traceId) {
        <p class="error-state__trace" role="note">מזהה מעקב לתמיכה: {{ view().traceId }}</p>
      }
      @if (view().hint) {
        <p class="error-state__hint">{{ view().hint }}</p>
      }
      <button mat-raised-button color="primary" type="button" (click)="retry.emit()">
        <mat-icon>refresh</mat-icon>
        ניסיון חוזר
      </button>
    </div>
  `,
  styles: [
    `
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64px 24px;
        text-align: center;
        background: var(--gov-card, #fff);
        border-radius: 10px;
        border: 1px solid rgba(0, 61, 122, 0.15);
        border-top: 4px solid #c62828;
        box-shadow: 0 2px 8px rgba(0, 61, 122, 0.08);
      }

      .error-state--network {
        border-top-color: #e65100;
      }

      .error-state--server {
        border-top-color: #b71c1c;
      }

      .error-state--notfound {
        border-top-color: #1565c0;
      }

      .error-state__icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: #ef5350;
        margin-bottom: 16px;
      }

      .error-state--network .error-state__icon {
        color: #fb8c00;
      }

      .error-state--notfound .error-state__icon {
        color: #1e88e5;
      }

      .error-state__title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #c62828;
        margin: 0 0 10px;
      }

      .error-state--network .error-state__title {
        color: #e65100;
      }

      .error-state--notfound .error-state__title {
        color: #1565c0;
      }

      .error-state__message {
        color: #444;
        margin: 0 0 12px;
        max-width: 440px;
        line-height: 1.55;
        font-size: 1rem;
      }

      .error-state__trace {
        font-size: 0.8rem;
        color: #666;
        font-family: ui-monospace, monospace;
        margin: 0 0 12px;
        word-break: break-all;
        max-width: 420px;
      }

      .error-state__hint {
        color: #666;
        margin: 0 0 22px;
        max-width: 420px;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .error-state__hint::before {
        content: '';
        display: block;
        width: 48px;
        height: 3px;
        background: rgba(0, 61, 122, 0.15);
        margin: 0 auto 14px;
        border-radius: 2px;
      }
    `,
  ],
})
export class ErrorStateComponent {
  /** כאשר קיים — מוצגים כותרת, אייקון והנחיה לפי סוג השגיאה. */
  readonly apiError = input<ApiError | null>(null);
  /** גיבוי כאשר אין אובייקט שגיאה מהשרת. */
  readonly message = input<string | undefined>(undefined);

  readonly retry = output<void>();

  protected readonly view = computed(() => {
    const err = this.apiError();
    if (err) {
      const variant = errorPresentationVariant(err.statusCode);
      const icon =
        variant === 'network'
          ? 'cloud_off'
          : variant === 'server'
            ? 'dns'
            : variant === 'notfound'
              ? 'search_off'
              : 'error_outline';
      return {
        variant,
        icon,
        title: errorStateTitle(err.statusCode),
        body: err.message,
        traceId: err.traceId ?? null,
        hint: errorStateHint(err.statusCode),
      };
    }

    return {
      variant: 'generic' as const,
      icon: 'error_outline',
      title: 'אירעה שגיאה',
      body: this.message() ?? 'אירעה שגיאה בלתי צפויה.',
      traceId: null as string | null,
      hint: null as string | null,
    };
  });
}
