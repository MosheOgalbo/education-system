/**
 * דיאלוג טופס תלמיד: מצב יצירה או עריכה; ולידציית ת״ז ישראלית, שם וגיל (5–19).
 */
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StudentDto, CreateStudentDto } from '../../../../core/models/student.model';
import {
  israeliIdentityValidator,
  personOrPlaceNameValidator,
  unchangedOrAgeInEnrollmentRangeValidator,
  unchangedOrIsraeliIdentityValidator,
  unchangedOrPersonNameValidator,
} from '../../../../core/validators/business-input.validators';

/** נתונים שנפתח איתם דיאלוג התלמיד (מצב + אופציונלי רשומה קיימת). */
export interface StudentDialogData {
  mode: 'create' | 'edit';
  student?: StudentDto;
  educationPlaceId: number;
}

@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  /* Default: כדי ש־mat-slide-toggle ושדות יעדכנו מיד את [disabled] של «שמירה» (OnPush עלול לא לרענן). */
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'הוספת תלמיד' : 'עריכת תלמיד' }}
    </h2>

    <mat-dialog-content>
      <div class="form-grid" [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>שם מלא</mat-label>
          <input matInput formControlName="name" placeholder="הזינו שם מלא" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>שדה חובה</mat-error>
          }
          @if (form.get('name')?.hasError('minLength') && form.get('name')?.touched) {
            <mat-error>לפחות 2 תווים</mat-error>
          }
          @if (form.get('name')?.hasError('maxLength') && form.get('name')?.touched) {
            <mat-error>עד 200 תווים</mat-error>
          }
          @if (form.get('name')?.hasError('invalidChars') && form.get('name')?.touched) {
            <mat-error>מותרות אותיות בעברית ובאנגלית, רווחים, מקף, נקודה ואפוסטרוף בלבד</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>מספר זהות</mat-label>
          <input matInput formControlName="identityNumber" placeholder="למשל 123456789" />
          @if (form.get('identityNumber')?.hasError('required') && form.get('identityNumber')?.touched) {
            <mat-error>שדה חובה</mat-error>
          }
          @if (form.get('identityNumber')?.hasError('israeliId') && form.get('identityNumber')?.touched) {
            <mat-error>יש להזין 5–9 ספרות</mat-error>
          }
          @if (
            form.get('identityNumber')?.hasError('israeliIdChecksum') && form.get('identityNumber')?.touched
          ) {
            <mat-error>מספר הזהות אינו חוקי</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>גיל</mat-label>
          <!-- ללא min/max ב-HTML: בעריכה גיל מעל 19 יכול להישאר במסד; מגבילים רק ב-Validators ב-TypeScript -->
          <input matInput type="number" formControlName="age" />
          @if (form.get('age')?.hasError('required') && form.get('age')?.touched) {
            <mat-error>שדה חובה</mat-error>
          }
          @if (form.get('age')?.hasError('min') || form.get('age')?.hasError('max')) {
            <mat-error>הגיל חייב להיות בין 5 ל־19</mat-error>
          }
          @if (form.get('age')?.hasError('invalidAge')) {
            <mat-error>יש להזין גיל מספרי תקין</mat-error>
          }
        </mat-form-field>

        <mat-slide-toggle formControlName="isActive" color="primary">
          תלמיד פעיל
        </mat-slide-toggle>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">ביטול</button>
      <button
        mat-raised-button
        color="primary"
        type="button"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        {{ data.mode === 'create' ? 'הוספה' : 'שמירה' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 380px;
        padding-top: 8px;
      }

      @media (max-width: 480px) {
        .form-grid {
          min-width: unset;
        }
      }
    `,
  ],
})
export class StudentFormDialogComponent {
  protected readonly data = inject<StudentDialogData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<StudentFormDialogComponent>);

  /** בעריכה: ולידציה מחמירה רק כשמשנים שדה — כדי לאפשר להחזיר ל«פעיל» בלי לתקן ת״ז/גיל ישנים במסד. */
  protected readonly form = new FormGroup({
    name: new FormControl(this.data.student?.name ?? '', [
      Validators.required,
      this.data.mode === 'edit' && this.data.student
        ? unchangedOrPersonNameValidator(this.data.student.name)
        : personOrPlaceNameValidator(),
    ]),
    identityNumber: new FormControl(this.data.student?.identityNumber ?? '', [
      Validators.required,
      this.data.mode === 'edit' && this.data.student
        ? unchangedOrIsraeliIdentityValidator(this.data.student.identityNumber)
        : israeliIdentityValidator(),
    ]),
    age: new FormControl(this.data.student?.age ?? null, [
      ...(this.data.mode === 'edit' && this.data.student
        ? ([
            Validators.required,
            unchangedOrAgeInEnrollmentRangeValidator(this.data.student.age, 5, 19),
          ] as const)
        : ([Validators.required, Validators.min(5), Validators.max(19)] as const)),
    ]),
    isActive: new FormControl(this.data.student?.isActive ?? true),
  });

  /** מחזיר CreateStudentDto כולל educationPlaceId מהנתונים שנפתחו איתם. */
  protected submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue() as CreateStudentDto;
    const name = String(raw.name).trim();
    const digits = String(raw.identityNumber).replace(/\D/g, '');
    const idNorm = digits.length < 9 ? digits.padStart(9, '0') : digits;

    const result: CreateStudentDto = {
      ...raw,
      name,
      identityNumber: idNorm,
      educationPlaceId: this.data.educationPlaceId,
      isActive: Boolean(raw.isActive),
    };

    this.dialogRef.close(result);
  }
}
