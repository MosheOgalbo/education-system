/**
 * חלונית סינון תלמידים: בחירת סטטוס — «ביטול» סוגר בלי שינוי, «סינון» מחיל את הבחירה.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

export interface StudentsFilterDialogData {
  initialFilter: boolean | null;
}

@Component({
  selector: 'app-students-filter-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatRadioModule, FormsModule],
  template: `
    <h2 mat-dialog-title class="dlg-title">סינון תלמידים</h2>
    <mat-dialog-content class="dlg-body">
      <mat-radio-group
        class="status-group"
        [(ngModel)]="draftMode"
        aria-label="סינון לפי סטטוס"
      >
        <mat-radio-button class="status-option" value="all">הכול</mat-radio-button>
        <mat-radio-button class="status-option" value="active">פעילים בלבד</mat-radio-button>
        <mat-radio-button class="status-option" value="inactive">בהשהייה בלבד</mat-radio-button>
      </mat-radio-group>
    </mat-dialog-content>
    <mat-dialog-actions class="dlg-actions">
      <button mat-stroked-button type="button" (click)="onCancel()">ביטול</button>
      <button mat-flat-button color="primary" type="button" (click)="onApply()">סינון</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dlg-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--gov-text);
    }
    .dlg-body {
      padding-top: 12px;
      min-width: 260px;
    }
    .status-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
    .status-option {
      margin: 0;
    }
    .dlg-actions {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding-top: 8px;
      box-sizing: border-box;
    }
  `,
})
export class StudentsFilterDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<StudentsFilterDialogComponent, boolean | null | undefined>,
  );
  private readonly dialogData = inject<StudentsFilterDialogData>(MAT_DIALOG_DATA);

  /** מצב טיוטה לתצוגה ברדיו — ממופה ל-boolean | null בעת החלה. */
  protected draftMode: 'all' | 'active' | 'inactive' = StudentsFilterDialogComponent.toMode(
    this.dialogData.initialFilter,
  );

  private static toMode(f: boolean | null): 'all' | 'active' | 'inactive' {
    if (f === null) return 'all';
    return f ? 'active' : 'inactive';
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onApply(): void {
    const filter: boolean | null =
      this.draftMode === 'all' ? null : this.draftMode === 'active' ? true : false;
    this.dialogRef.close(filter);
  }
}
