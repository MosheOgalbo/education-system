/**
 * הצלחה / שגיאה מוצגות במודל מרכזי; מידע נשאר ב-MatSnackBar.
 */
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { OperationFeedbackService } from './operation-feedback.service';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly operationFeedback = inject(OperationFeedbackService);

  private readonly BASE_CONFIG: MatSnackBarConfig = {
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  /** הודעת הצלחה במודל מרכזי (סגירה אוטומטית / ✕ / רקע). */
  success(message: string): void {
    this.operationFeedback.showSuccess(message);
  }

  /** הודעת שגיאה במודל מרכזי עד לסגירה ידנית. */
  error(message: string): void {
    this.operationFeedback.showError(message);
  }

  /** הודעת מידע כללית. */
  info(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.BASE_CONFIG,
      duration: 4000,
      panelClass: ['toast--info'],
    });
  }
}
