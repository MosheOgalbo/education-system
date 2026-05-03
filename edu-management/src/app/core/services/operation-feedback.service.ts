/**
 * מודל פידבק מרכזי להודעות הצלחה / שגיאה אחרי פעולות מול השרת.
 * הצלחה: סגירה אוטומטית אחרי 3 שניות, כפתור ✕ או לחיצה על הרקע.
 * שגיאה: נשאר עד סגירה ידנית (✕ או רקע).
 */
import { Injectable, signal } from '@angular/core';

export type OperationFeedbackVariant = 'success' | 'error';

export interface OperationFeedbackState {
  open: boolean;
  variant: OperationFeedbackVariant;
  message: string;
}

const CLOSED: OperationFeedbackState = {
  open: false,
  variant: 'success',
  message: '',
};

@Injectable({ providedIn: 'root' })
export class OperationFeedbackService {
  private readonly _state = signal<OperationFeedbackState>(CLOSED);
  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  readonly state = this._state.asReadonly();

  /** הודעת הצלחה — נסגר אוטומטית אחרי 3 שניות (ניתן לסגור לפני). */
  showSuccess(message: string): void {
    this.clearAutoClose();
    this._state.set({ open: true, variant: 'success', message });
    this.autoCloseTimer = setTimeout(() => this.close(), 3000);
  }

  /** הודעת שגיאה — ללא סגירה אוטומטית. */
  showError(message: string): void {
    this.clearAutoClose();
    this._state.set({ open: true, variant: 'error', message });
  }

  close(): void {
    this.clearAutoClose();
    this._state.set(CLOSED);
  }

  private clearAutoClose(): void {
    if (this.autoCloseTimer != null) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }
}
