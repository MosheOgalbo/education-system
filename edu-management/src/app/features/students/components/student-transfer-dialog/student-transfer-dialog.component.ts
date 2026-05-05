/**
 * דיאלוג להעברת תלמיד לפנימייה אחרת (רשימת פנימיות פעילות/בהשהייה בלבד).
 */
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { EducationPlacesService } from '../../../education-places/services/education-places.service';
import {
  educationPlaceAcceptsEnrollment,
  type EducationPlaceStatsDto,
} from '../../../../core/models/education-place.model';
import type { StudentDto } from '../../../../core/models/student.model';

export interface StudentTransferDialogData {
  student: StudentDto;
  currentEducationPlaceId: number;
}

@Component({
  selector: 'app-student-transfer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>מעבר לפנימייה אחרת</h2>
    <mat-dialog-content>
      <p class="dialog-intro">
        בוחרים פנימייה לשיבוץ מחדש של <strong>{{ data.student.name }}</strong> (תלמידים לא פעילים
        נספרים ביעד לצורכי סטטיסטיקה).
      </p>
      @if (loadError()) {
        <p class="dialog-error" role="alert">{{ loadError() }}</p>
      } @else if (loading()) {
        <p>טוען רשימת פנימיות…</p>
      } @else if (eligiblePlaces().length === 0) {
        <p class="dialog-error" role="alert">אין פנימייה זמינה להעברה (פעילה או בהשהייה).</p>
      } @else {
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>פנימייה</mat-label>
          <mat-select [formControl]="placeIdCtrl">
            @for (p of eligiblePlaces(); track p.id) {
              <mat-option [value]="p.id">
                {{ optionLabel(p) }}
              </mat-option>
            }
          </mat-select>
          @if (placeIdCtrl.invalid && placeIdCtrl.touched) {
            <mat-error>יש לבחור פנימייה</mat-error>
          }
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">ביטול</button>
      <button
        mat-raised-button
        color="primary"
        type="button"
        [disabled]="loading() || eligiblePlaces().length === 0 || placeIdCtrl.invalid"
        (click)="confirm()"
      >
        העברה
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-intro {
      margin: 0 0 12px;
      line-height: 1.5;
      color: var(--gov-text);
    }
    .dialog-error {
      margin: 0;
      color: #c62828;
      font-weight: 600;
    }
    .full-width {
      width: 100%;
      margin-top: 8px;
    }
  `,
})
export class StudentTransferDialogComponent implements OnInit {
  protected readonly data = inject<StudentTransferDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<StudentTransferDialogComponent, number | undefined>);
  private readonly placesService = inject(EducationPlacesService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly places = signal<EducationPlaceStatsDto[]>([]);

  protected readonly placeIdCtrl = new FormControl<number | null>(null, Validators.required);

  protected readonly eligiblePlaces = computed(() =>
    this.places().filter(
      (p) =>
        p.id !== this.data.currentEducationPlaceId && educationPlaceAcceptsEnrollment(p.status),
    ),
  );

  /** סגירה מפורשת — ללא `mat-dialog-close` (ב-HTML מאפיין בוליאני עלול להיסגר עם `true` ולגרום לקריאת API שגויה). */
  protected cancel(): void {
    this.dialogRef.close(undefined);
  }

  async ngOnInit(): Promise<void> {
    try {
      const all = await this.placesService.getAllAsync();
      this.places.set(all);
    } catch {
      this.loadError.set('לא ניתן לטעון את רשימת הפנימיות. נסו שוב.');
    } finally {
      this.loading.set(false);
    }
  }

  protected confirm(): void {
    this.placeIdCtrl.markAsTouched();
    const id = this.placeIdCtrl.value;
    if (id == null || this.placeIdCtrl.invalid) return;
    const placeId = typeof id === 'number' ? id : Number(id);
    if (!Number.isFinite(placeId) || placeId <= 0) return;
    const picked = this.places().find((p) => p.id === placeId);
    if (!picked || !educationPlaceAcceptsEnrollment(picked.status)) {
      return;
    }
    this.dialogRef.close(placeId);
  }

  protected optionLabel(p: EducationPlaceStatsDto): string {
    const base = `${p.name} — ${p.city}`;
    return p.status === 'suspended' ? `${base} (בהשהייה)` : base;
  }
}
