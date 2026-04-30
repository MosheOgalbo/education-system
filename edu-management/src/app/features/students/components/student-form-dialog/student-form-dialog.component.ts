import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import type { Student } from '../../../../core/models/student.model';
import { StudentsService } from '../../services/students.service';
import {
  AutocompleteInputComponent,
  type AutocompleteOption,
} from '../../../../shared/components/autocomplete-input/autocomplete-input.component';

export interface StudentFormDialogData {
  student?: Student;
  places: AutocompleteOption[];
}

@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    AutocompleteInputComponent,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.student ? 'עריכת תלמיד' : 'תלמיד חדש' }}</h2>
    <mat-dialog-content [formGroup]="form">
      <app-autocomplete-input
        label="פנימייה"
        [options]="data.places"
        [selectedId]="placeControl"
      />
      <mat-form-field appearance="outline" class="full">
        <mat-label>שם</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>תעודת זהות</mat-label>
        <input matInput formControlName="identityNumber" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>גיל</mat-label>
        <input matInput type="number" formControlName="age" />
      </mat-form-field>
      <mat-checkbox formControlName="isActive">פעיל</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>ביטול</button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        [disabled]="form.invalid || saving"
        (click)="submit()"
      >
        שמור
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 320px;
    }
    .full {
      width: 100%;
    }
  `,
})
export class StudentFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(StudentsService);
  readonly dialogRef = inject(MatDialogRef<StudentFormDialogComponent, Student | undefined>);
  readonly data = inject<StudentFormDialogData>(MAT_DIALOG_DATA);

  readonly placeControl = this.fb.control<number | null>(null, Validators.required);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    identityNumber: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(1), Validators.max(120)]],
    isActive: [true],
  });

  saving = false;

  ngOnInit(): void {
    const s = this.data.student;
    if (s) {
      this.form.patchValue({
        name: s.name,
        identityNumber: s.identityNumber,
        age: s.age,
        isActive: s.isActive,
      });
      this.placeControl.setValue(s.educationPlaceId);
    }
  }

  submit(): void {
    if (this.form.invalid || this.placeControl.invalid) {
      return;
    }
    const placeId = this.placeControl.value;
    if (placeId == null) {
      return;
    }
    const body = {
      ...this.form.getRawValue(),
      educationPlaceId: placeId,
    };
    this.saving = true;
    const s = this.data.student;
    if (s) {
      this.api.update(s.id, body).subscribe({
        next: (row) => this.dialogRef.close(row),
        error: () => (this.saving = false),
      });
    } else {
      this.api.create(body).subscribe({
        next: (row) => this.dialogRef.close(row),
        error: () => (this.saving = false),
      });
    }
  }
}
