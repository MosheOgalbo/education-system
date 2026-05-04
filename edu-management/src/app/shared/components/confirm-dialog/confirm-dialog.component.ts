/**
 * דיאלוג אישור Material במקום window.confirm — עיצוב אחיד עם שאר המערכת.
 * window.alert / confirm נייטיביים: להימנע מהם אלא אם יש דרישה חריגה (חסימה סינכרונית וכו׳).
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true — כפתור אישור בצבע warn (מחיקות). */
  destructive?: boolean;
  /** true — רק כפתור סגירה אחד (התראה / הסבר), ללא אישור פעולה. */
  alertOnly?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="confirm-dialog__title">{{ data.title }}</h2>
    <mat-dialog-content class="confirm-dialog__body">
      <p class="confirm-dialog__message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="confirm-dialog__actions">
      @if (data.alertOnly) {
        <button mat-flat-button type="button" color="primary" [mat-dialog-close]="false">
          {{ data.confirmLabel ?? 'הבנתי' }}
        </button>
      } @else {
        <button mat-button type="button" [mat-dialog-close]="false">
          {{ data.cancelLabel ?? 'ביטול' }}
        </button>
        <button
          mat-flat-button
          type="button"
          [color]="data.destructive ? 'warn' : 'primary'"
          [mat-dialog-close]="true"
        >
          {{ data.confirmLabel ?? 'אישור' }}
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    .confirm-dialog__title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--gov-text);
    }

    .confirm-dialog__body {
      padding-top: 8px;
      padding-bottom: 4px;
    }

    .confirm-dialog__message {
      margin: 0;
      font-size: 1rem;
      line-height: 1.55;
      color: var(--gov-text);
    }

    .confirm-dialog__actions {
      padding-top: 8px;
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
