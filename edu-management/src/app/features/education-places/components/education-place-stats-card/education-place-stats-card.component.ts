/**
 * כרטיס תצוגה לנתוני סטטיסטיקה של פנימייה אחת (שימושי במובייל).
 */
import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import type { EducationPlaceStatsDto } from '../../../../core/models/education-place.model';

@Component({
  selector: 'app-education-place-stats-card',
  standalone: true,
  imports: [MatCardModule, DecimalPipe],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ stats().name }}</mat-card-title>
        <mat-card-subtitle>{{ stats().city }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>תלמידים פעילים: <strong>{{ stats().activeStudentCount }}</strong></p>
        <p>גיל ממוצע: <strong>{{ stats().averageAge | number: '1.1-1' }}</strong></p>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card {
      height: 100%;
    }
    p {
      margin: 0.35rem 0;
      font: var(--mat-sys-body-medium);
    }
  `,
})
export class EducationPlaceStatsCardComponent {
  readonly stats = input.required<EducationPlaceStatsDto>();
}
