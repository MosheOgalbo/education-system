/**
 * דיאלוג Material: טופס Reactive להוספת פנימייה (שם + עיר); סוגר עם DTO או בלי ערך.
 * משתמש ב-typed forms ו-FormBuilder לטיוב טיפוס.
 */
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateEducationPlaceDto } from '../../../../core/models/education-place.model';
import { personOrPlaceNameValidator } from '../../../../core/validators/business-input.validators';

interface CreatePlaceFormModel {
  name: string | null;
  city: string | null;
}

@Component({
  selector: 'app-education-place-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>הוספת פנימייה</h2>

    <mat-dialog-content>
      <div class="form-grid" [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>שם הפנימייה</mat-label>
          <input matInput formControlName="name" placeholder="לדוגמה: פנימיית ההר" />
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
          <mat-label>עיר</mat-label>
          <input matInput formControlName="city" placeholder="לדוגמה: ירושלים" />
          @if (form.get('city')?.hasError('required') && form.get('city')?.touched) {
            <mat-error>שדה חובה</mat-error>
          }
          @if (form.get('city')?.hasError('minLength') && form.get('city')?.touched) {
            <mat-error>לפחות 2 תווים</mat-error>
          }
          @if (form.get('city')?.hasError('maxLength') && form.get('city')?.touched) {
            <mat-error>עד 200 תווים</mat-error>
          }
          @if (form.get('city')?.hasError('invalidChars') && form.get('city')?.touched) {
            <mat-error>מותרות אותיות בעברית ובאנגלית, רווחים, מקף, נקודה ואפוסטרוף בלבד</mat-error>
          }
        </mat-form-field>
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
        הוספה
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 360px;
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
export class EducationPlaceFormDialogComponent {
  protected readonly dialogRef = inject(MatDialogRef<EducationPlaceFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  protected readonly form: FormGroup<{ name: any; city: any }> = this.fb.group({
    name: ['', [Validators.required, personOrPlaceNameValidator()]],
    city: ['', [Validators.required, personOrPlaceNameValidator()]],
  });

  /** סוגר את הדיאלוג עם DTO אם הטופס תקין. */
  protected submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue() as CreatePlaceFormModel;
    const dto: CreateEducationPlaceDto = {
      name: (raw.name ?? '').trim(),
      city: (raw.city ?? '').trim(),
    };
    this.dialogRef.close(dto);
  }
}
