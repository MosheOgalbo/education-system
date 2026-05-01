import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StudentsStore } from '../../store/students.store';
import { StudentDto } from '../../../../core/models/student.model';
import { ColumnDef, TableAction } from '../../../../shared/components/generic-table/generic-table.types';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import {
  StudentFormDialogComponent,
  StudentDialogData,
} from '../student-form-dialog/student-form-dialog.component';

@Component({
  selector: 'app-students-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    GenericTableComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.scss',
})
export class StudentsPageComponent implements OnInit {
  protected readonly store = inject(StudentsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly educationPlaceId = signal<number>(0);

  protected readonly columns: ColumnDef<StudentDto>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'identityNumber', label: 'ID Number', sortable: true },
    { key: 'age', label: 'Age', sortable: true, align: 'center' },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (row) => (row.isActive ? '✅ Active' : '⛔ Inactive'),
      cellClass: (row) => (row.isActive ? 'status--active' : 'status--inactive'),
    },
  ];

  protected readonly actions: TableAction<StudentDto>[] = [
    {
      icon: 'edit',
      label: 'Edit',
      color: 'primary',
      handler: (row) => this.openEditDialog(row),
    },
    {
      icon: 'delete',
      label: 'Delete',
      color: 'warn',
      handler: (row) => this.deleteStudent(row),
    },
  ];

  protected readonly filterOptions = [
    { label: 'All', value: null as boolean | null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.educationPlaceId.set(id);
    this.store.load(id);
  }

  protected openCreateDialog(): void {
    const ref = this.dialog.open<StudentFormDialogComponent, StudentDialogData>(
      StudentFormDialogComponent,
      {
        data: { mode: 'create', educationPlaceId: this.educationPlaceId() },
        width: '480px',
      },
    );

    ref.afterClosed().subscribe((result) => {
      if (result) void this.store.createStudent(result);
    });
  }

  private openEditDialog(student: StudentDto): void {
    const ref = this.dialog.open<StudentFormDialogComponent, StudentDialogData>(
      StudentFormDialogComponent,
      {
        data: {
          mode: 'edit',
          student,
          educationPlaceId: this.educationPlaceId(),
        },
        width: '480px',
      },
    );

    ref.afterClosed().subscribe((result) => {
      if (result) void this.store.updateStudent(student.id, { ...result, id: student.id });
    });
  }

  private deleteStudent(student: StudentDto): void {
    if (confirm(`Remove "${student.name}"?`)) {
      void this.store.deleteStudent(student.id, student.name);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/education-places']);
  }
}
