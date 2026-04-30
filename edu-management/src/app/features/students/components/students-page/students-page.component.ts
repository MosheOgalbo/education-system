import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import type { Student } from '../../../../core/models/student.model';
import { EducationPlacesStore } from '../../../education-places/store/education-places.store';
import { StudentsStore } from '../../store/students.store';
import { StudentsService } from '../../services/students.service';
import {
  StudentFormDialogComponent,
  type StudentFormDialogData,
} from '../student-form-dialog/student-form-dialog.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-students-page',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.scss',
})
export class StudentsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly studentsApi = inject(StudentsService);
  private readonly studentsStore = inject(StudentsStore);
  private readonly placesStore = inject(EducationPlacesStore);

  readonly students = this.studentsStore.students;
  readonly loading = this.studentsStore.loading;
  readonly error = this.studentsStore.error;
  readonly filterPlaceId = this.studentsStore.filterPlaceId;

  readonly displayedColumns = [
    'id',
    'name',
    'identityNumber',
    'age',
    'educationPlaceId',
    'isActive',
    'actions',
  ] as const;

  readonly placeOptions = computed(() =>
    this.placesStore.places().map((p) => ({ id: p.id, label: `${p.name} — ${p.city}` }))
  );

  ngOnInit(): void {
    this.placesStore.load();
    this.route.queryParamMap.subscribe((q) => {
      const raw = q.get('educationPlaceId');
      this.studentsStore.setFilterPlaceId(raw != null && raw !== '' ? Number(raw) : null);
      this.studentsStore.load();
    });
  }

  retry(): void {
    this.studentsStore.load();
  }

  openCreate(): void {
    this.openDialog({});
  }

  openEdit(row: Student): void {
    this.openDialog({ student: row });
  }

  private openDialog(extra: Partial<StudentFormDialogData>): void {
    this.dialog
      .open<StudentFormDialogComponent, StudentFormDialogData, Student | undefined>(
        StudentFormDialogComponent,
        {
          width: '520px',
          data: { places: this.placeOptions(), ...extra },
        }
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.studentsStore.upsertLocal(result);
        }
      });
  }

  deleteRow(row: Student): void {
    if (!confirm(`למחוק את ${row.name}?`)) {
      return;
    }
    this.studentsApi.delete(row.id).subscribe(() => this.studentsStore.removeLocal(row.id));
  }
}
