/**
 * חלונית סינון פנימיות: סה״כ משויכים, פעילים, ממוצע גיל, סטטוס, עיר.
 * «סינון» תמיד מחיל את הבחירה (גם כשהתוצאה ריקה — למשל מספר שלא קיים בנתונים).
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { EducationPlaceStatus } from '../../../../core/models/education-place.model';
import { EducationPlacesStructuredFilters } from '../../models/education-places-filter.model';

export interface EducationPlacesFilterDialogData {
  cities: string[];
  initial: EducationPlacesStructuredFilters;
}

@Component({
  selector: 'app-education-places-filter-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title class="dlg-title">סינון פנימיות</h2>
    <mat-dialog-content class="dlg-body">
      <section class="dlg-section" aria-labelledby="sec-students">
        <h3 id="sec-students" class="dlg-section__title">כמות תלמידים (סה״כ משויכים)</h3>
        <mat-form-field appearance="outline" class="dlg-field dlg-field--full">
          <mat-label>מספר תלמידים מדויק</mat-label>
          <input
            matInput
            type="text"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            [value]="draftTotalStudents"
            (input)="onTotalStudentsInput($event)"
            (keydown)="onTotalStudentsKeydown($event)"
            (paste)="onTotalStudentsPaste($event)"
            placeholder="למשל 12"
          />
          <mat-hint>התאמה מדויקת — רק ספרות</mat-hint>
        </mat-form-field>
      </section>

      <section class="dlg-section" aria-labelledby="sec-active">
        <h3 id="sec-active" class="dlg-section__title">כמות תלמידים פעילים</h3>
        <mat-form-field appearance="outline" class="dlg-field dlg-field--full">
          <mat-label>מספר תלמידים פעילים מדויק</mat-label>
          <input
            matInput
            type="text"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            [value]="draftActiveStudents"
            (input)="onActiveStudentsInput($event)"
            (keydown)="onActiveStudentsKeydown($event)"
            (paste)="onActiveStudentsPaste($event)"
            placeholder="למשל 8"
          />
          <mat-hint>התאמה מדויקת — רק ספרות</mat-hint>
        </mat-form-field>
      </section>

      <section class="dlg-section" aria-labelledby="sec-avg">
        <h3 id="sec-avg" class="dlg-section__title">ממוצע גיל (כולל)</h3>
        <mat-form-field appearance="outline" class="dlg-field dlg-field--full">
          <mat-label>ממוצע גיל</mat-label>
          <input
            matInput
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            [value]="draftAverageAge"
            (input)="onAverageAgeInput($event)"
            (keydown)="onAverageAgeKeydown($event)"
            (paste)="onAverageAgePaste($event)"
            placeholder="למשל 10.5"
          />
          <mat-hint>מספר עשרוני — רק ספרות ונקודה אחת</mat-hint>
        </mat-form-field>
      </section>

      <section class="dlg-section" aria-labelledby="sec-status">
        <h3 id="sec-status" class="dlg-section__title">סטטוס</h3>
        <mat-form-field appearance="outline" class="dlg-field dlg-field--full">
          <mat-label>סטטוס פנימייה</mat-label>
          <mat-select [(ngModel)]="draftStatus">
            <mat-option [value]="emptyStatus">הכול</mat-option>
            <mat-option value="active">פעילה</mat-option>
            <mat-option value="suspended">בהשהייה</mat-option>
            <mat-option value="inactive">לא פעילה</mat-option>
          </mat-select>
        </mat-form-field>
      </section>

      <section class="dlg-section" aria-labelledby="sec-city">
        <h3 id="sec-city" class="dlg-section__title">עיר</h3>
        <mat-form-field appearance="outline" class="dlg-field dlg-field--full">
          <mat-label>עיר</mat-label>
          <mat-select [(ngModel)]="draftCity">
            <mat-option [value]="''">כל הערים</mat-option>
            @for (city of data.cities; track city) {
              <mat-option [value]="city">{{ city }}</mat-option>
            }
          </mat-select>
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
      gap: 16px;
      padding-top: 12px;
      min-width: min(100%, 320px);
      max-height: min(70vh, 520px);
      overflow-y: auto;
    }
    .dlg-section__title {
      margin: 0 0 8px;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--gov-header);
    }
    .dlg-field {
      flex: 1;
      min-width: 120px;
    }
    .dlg-field--full {
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
export class EducationPlacesFilterDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<EducationPlacesFilterDialogComponent, EducationPlacesStructuredFilters | undefined>,
  );
  protected readonly data = inject<EducationPlacesFilterDialogData>(MAT_DIALOG_DATA);

  protected readonly emptyStatus = '';

  protected draftTotalStudents = '';
  protected draftActiveStudents = '';
  protected draftAverageAge = '';
  protected draftStatus: EducationPlaceStatus | '' = '';
  protected draftCity = '';

  constructor() {
    const i = this.data.initial;
    this.draftCity = i.city ?? '';
    this.draftStatus = i.status ?? '';
    this.draftTotalStudents =
      i.totalStudents != null && Number.isFinite(i.totalStudents) ? String(i.totalStudents) : '';
    this.draftActiveStudents =
      i.activeStudents != null && Number.isFinite(i.activeStudents)
        ? String(i.activeStudents)
        : '';
    this.draftAverageAge =
      i.averageAge != null && Number.isFinite(i.averageAge) ? String(i.averageAge) : '';
  }

  /** רק ספרות — מסנן אחרי input/paste */
  protected onTotalStudentsInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const next = digitsOnly(el.value);
    this.commitTotalStudents(el, next);
  }

  /** חוסם תווים לא־ספרתיים לפני שמופיעים בשדה */
  protected onTotalStudentsKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (navigationKeys.has(e.key)) return;
    if (e.key.length === 1 && digitKeys.test(e.key)) return;
    e.preventDefault();
  }

  protected onTotalStudentsPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const el = e.target as HTMLInputElement;
    const chunk = digitsOnly(e.clipboardData?.getData('text') ?? '');
    const merged = mergePaste(el.value, el.selectionStart, el.selectionEnd, chunk, digitsOnly);
    this.commitTotalStudents(el, merged);
  }

  protected onActiveStudentsInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const next = digitsOnly(el.value);
    this.commitActiveStudents(el, next);
  }

  protected onActiveStudentsKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (navigationKeys.has(e.key)) return;
    if (e.key.length === 1 && digitKeys.test(e.key)) return;
    e.preventDefault();
  }

  protected onActiveStudentsPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const el = e.target as HTMLInputElement;
    const chunk = digitsOnly(e.clipboardData?.getData('text') ?? '');
    const merged = mergePaste(el.value, el.selectionStart, el.selectionEnd, chunk, digitsOnly);
    this.commitActiveStudents(el, merged);
  }

  /** ספרות + נקודה עשרונית אחת */
  protected onAverageAgeInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const next = decimalOneDot(el.value);
    this.commitAverageAge(el, next);
  }

  protected onAverageAgeKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (navigationKeys.has(e.key)) return;
    if (e.key.length === 1 && digitKeys.test(e.key)) return;
    const isDecimalSep =
      e.key === '.' || e.key === ',' || e.code === 'NumpadDecimal';
    if (isDecimalSep) {
      if (this.draftAverageAge.includes('.')) e.preventDefault();
      return;
    }
    e.preventDefault();
  }

  protected onAverageAgePaste(e: ClipboardEvent): void {
    e.preventDefault();
    const el = e.target as HTMLInputElement;
    const chunk = decimalOneDot(e.clipboardData?.getData('text') ?? '');
    const merged = mergePaste(
      el.value,
      el.selectionStart,
      el.selectionEnd,
      chunk,
      decimalOneDot,
    );
    this.commitAverageAge(el, merged);
  }

  private commitTotalStudents(el: HTMLInputElement, next: string): void {
    this.draftTotalStudents = next;
    if (el.value !== next) el.value = next;
  }

  private commitActiveStudents(el: HTMLInputElement, next: string): void {
    this.draftActiveStudents = next;
    if (el.value !== next) el.value = next;
  }

  private commitAverageAge(el: HTMLInputElement, next: string): void {
    this.draftAverageAge = next;
    if (el.value !== next) el.value = next;
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onApply(): void {
    const result: EducationPlacesStructuredFilters = {
      city: this.draftCity === '' ? null : this.draftCity,
      status: this.draftStatus === '' ? null : (this.draftStatus as EducationPlaceStatus),
      totalStudents: parseOptionalPositiveInt(this.draftTotalStudents),
      activeStudents: parseOptionalPositiveInt(this.draftActiveStudents),
      averageAge: parseOptionalNonNegativeFloat(this.draftAverageAge),
    };
    this.dialogRef.close(result);
  }
}

function parseOptionalPositiveInt(s: string): number | null {
  const t = s.trim();
  if (t === '') return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseOptionalNonNegativeFloat(s: string): number | null {
  const t = s.trim();
  if (t === '' || t === '.') return null;
  const n = parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
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

/** ספרות ונקודה עשרונית אחת — פסיק מומר לנקודה */
function decimalOneDot(s: string): string {
  let out = s.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const firstDot = out.indexOf('.');
  if (firstDot !== -1) {
    const rest = out.slice(firstDot + 1).replace(/\./g, '');
    out = out.slice(0, firstDot + 1) + rest;
  }
  return out;
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
