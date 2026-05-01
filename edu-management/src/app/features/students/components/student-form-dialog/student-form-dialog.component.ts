import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StudentDto, CreateStudentDto } from '../../../../core/models/student.model';

export interface StudentDialogData {
  mode: 'create' | 'edit';
  student?: StudentDto;
  educationPlaceId: number;
}

@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Student' : 'Edit Student' }}</h2>

    <mat-dialog-content>
      <div class="form-grid" [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter full name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Identity Number</mat-label>
          <input matInput formControlName="identityNumber" placeholder="9-digit number" />
          @if (form.get('identityNumber')?.hasError('pattern')) {
            <mat-error>Must be exactly 9 digits</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Age</mat-label>
          <input matInput type="number" formControlName="age" min="5" max="120" />
          @if (form.get('age')?.hasError('min') || form.get('age')?.hasError('max')) {
            <mat-error>Age must be between 5 and 120</mat-error>
          }
        </mat-form-field>

        <mat-slide-toggle formControlName="isActive" color="primary">
          Active Student
        </mat-slide-toggle>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        type="button"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        {{ data.mode === 'create' ? 'Add Student' : 'Save Changes' }}
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
  private readonly dialogRef = inject(MatDialogRef<StudentFormDialogComponent>);

  protected readonly form = new FormGroup({
    name: new FormControl(this.data.student?.name ?? '', [
      Validators.required,
      Validators.minLength(2),
    ]),
    identityNumber: new FormControl(this.data.student?.identityNumber ?? '', [
      Validators.required,
      Validators.pattern(/^\d{9}$/),
    ]),
    age: new FormControl(this.data.student?.age ?? null, [
      Validators.required,
      Validators.min(5),
      Validators.max(120),
    ]),
    isActive: new FormControl(this.data.student?.isActive ?? true),
  });

  protected submit(): void {
    if (this.form.invalid) return;

    const result: CreateStudentDto = {
      ...(this.form.getRawValue() as CreateStudentDto),
      educationPlaceId: this.data.educationPlaceId,
    };

    this.dialogRef.close(result);
  }
}
