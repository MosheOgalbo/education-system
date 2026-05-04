/**
 * חלונית סינון תלמידים: סטטוס, חיפוש בשם, גיל מדויק — «ביטול» ללא שינוי, «סינון» מחיל.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { StudentsListFilters } from '../../models/students-list-filter.model';

export interface StudentsFilterDialogData {
  initial: StudentsListFilters;
}

@Component({
  selector: 'app-students-filter-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title class="dlg-title">סינון תלמידים</h2>
    <mat-dialog-content class="dlg-body">
      <section class="dlg-section" aria-labelledby="lbl-status">
        <h3 id="lbl-status" class="dlg-section__title">סטטוס</h3>
        <mat-radio-group
          class="status-group"
          [(ngModel)]="draftMode"
          aria-label="סינון לפי סטטוס"
        >
          <mat-radio-button class="status-option" value="all">הכול</mat-radio-button>
          <mat-radio-button class="status-option" value="active">פעילים בלבד</mat-radio-button>
          <mat-radio-button class="status-option" value="inactive">בהשהייה בלבד</mat-radio-button>
        </mat-radio-group>
      </section>

      <section class="dlg-section" aria-labelledby="lbl-name">
        <h3 id="lbl-name" class="dlg-section__title">שם תלמיד</h3>
        <mat-form-field appearance="outline" class="dlg-field">
          <mat-label>חיפוש לפי שם</mat-label>
          <input
            matInput
            type="text"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="draftNameQuery"
            placeholder="הקלדת חלק מהשם"
          />
          <mat-hint>מציג תלמידים שהשם שלהם מכיל את הטקסט</mat-hint>
        </mat-form-field>
      </section>

      <section class="dlg-section" aria-labelledby="lbl-age">
        <h3 id="lbl-age" class="dlg-section__title">גיל</h3>
        <mat-form-field appearance="outline" class="dlg-field">
          <mat-label>גיל מדויק</mat-label>
          <input
            matInput
            type="text"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            [value]="draftAge"
            (input)="onAgeInput($event)"
            (keydown)="onAgeKeydown($event)"
            (paste)="onAgePaste($event)"
            placeholder="למשל 14"
          />
          <mat-hint>רק ספרות — התאמה מדויקת לגיל</mat-hint>
        </mat-form-field>
      </section>
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
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding-top: 12px;
      min-width: 280px;
      max-width: min(100%, 400px);
    }
    .dlg-section__title {
      margin: 0 0 8px;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--gov-header);
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
    .dlg-field {
      width: 100%;
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
    MatDialogRef<StudentsFilterDialogComponent, StudentsListFilters | undefined>,
  );
  private readonly dialogData = inject<StudentsFilterDialogData>(MAT_DIALOG_DATA);

  protected draftMode: 'all' | 'active' | 'inactive' = StudentsFilterDialogComponent.toMode(
    this.dialogData.initial.status,
  );
  protected draftNameQuery = this.dialogData.initial.nameQuery ?? '';
  protected draftAge =
    this.dialogData.initial.age != null && Number.isFinite(this.dialogData.initial.age)
      ? String(this.dialogData.initial.age)
      : '';

  private static toMode(f: boolean | null): 'all' | 'active' | 'inactive' {
    if (f === null) return 'all';
    return f ? 'active' : 'inactive';
  }

  protected onAgeInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const next = digitsOnly(el.value);
    this.commitAge(el, next);
  }

  protected onAgeKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (navigationKeys.has(e.key)) return;
    if (e.key.length === 1 && digitKeys.test(e.key)) return;
    e.preventDefault();
  }

  protected onAgePaste(e: ClipboardEvent): void {
    e.preventDefault();
    const el = e.target as HTMLInputElement;
    const chunk = digitsOnly(e.clipboardData?.getData('text') ?? '');
    const merged = mergePaste(el.value, el.selectionStart, el.selectionEnd, chunk, digitsOnly);
    this.commitAge(el, merged);
  }

  private commitAge(el: HTMLInputElement, next: string): void {
    this.draftAge = next;
    if (el.value !== next) el.value = next;
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onApply(): void {
    const status: boolean | null =
      this.draftMode === 'all' ? null : this.draftMode === 'active' ? true : false;
    const age = parseOptionalNat(this.draftAge);
    const result: StudentsListFilters = {
      status,
      nameQuery: this.draftNameQuery,
      age,
    };
    this.dialogRef.close(result);
  }
}

const digitKeys = /^[0-9]$/;
const navigationKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

function mergePaste(
  value: string,
  selStart: number | null,
  selEnd: number | null,
  pastedClean: string,
  sanitize: (v: string) => string,
): string {
  const start = selStart ?? value.length;
  const end = selEnd ?? value.length;
  const merged = value.slice(0, start) + pastedClean + value.slice(end);
  return sanitize(merged);
}

function parseOptionalNat(s: string): number | null {
  const t = s.trim();
  if (t === '') return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
