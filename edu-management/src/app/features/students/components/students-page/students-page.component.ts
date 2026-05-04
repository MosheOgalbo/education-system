/**
 * דף רשימת תלמידים למוסד שנבחר ב-route (`:id`). שם הפנימייה נטען בנפרד לכותרת.
 * טבלה עם תפריט פעולות (כמו בדף הפנימיות) לעריכה/העברה/מחיקה.
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { EducationPlacesService } from '../../../education-places/services/education-places.service';
import { StudentsStore } from '../../store/students.store';
import { StudentDto, UpdateStudentDto } from '../../../../core/models/student.model';
import { ColumnDef, TableAction } from '../../../../shared/components/generic-table/generic-table.types';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import {
  StudentFormDialogComponent,
  StudentDialogData,
} from '../student-form-dialog/student-form-dialog.component';
import {
  StudentTransferDialogComponent,
  StudentTransferDialogData,
} from '../student-transfer-dialog/student-transfer-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  StudentsFilterDialogComponent,
  StudentsFilterDialogData,
} from '../students-filter-dialog/students-filter-dialog.component';
import {
  StudentsFilterTabId,
  StudentsListFilters,
} from '../../models/students-list-filter.model';
@Component({
  selector: 'app-students-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
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
  private readonly placesService = inject(EducationPlacesService);

  protected readonly educationPlaceId = signal<number>(0);
  protected readonly placeName = signal<string | null>(null);

  /** עמודות טבלת תלמידים. */
  protected readonly columns: ColumnDef<StudentDto>[] = [
    { key: 'name', label: 'שם מלא', sortable: true },
    { key: 'identityNumber', label: 'מספר זהות', sortable: true },
    { key: 'age', label: 'גיל', sortable: true, align: 'center' },
    {
      key: 'isActive',
      label: 'סטטוס',
      align: 'center',
      render: (row) => (row.isActive ? 'פעיל' : 'בהשהייה'),
      cellClass: (row) => (row.isActive ? 'status--active' : 'status--suspended'),
    },
  ];

  /** עריכה, העברה לפנימייה אחרת, מחיקה מהמערכת. */
  protected readonly actions: TableAction<StudentDto>[] = [
    {
      icon: 'edit',
      label: 'עריכה',
      color: 'primary',
      handler: (row) => this.openEditDialog(row),
    },
    {
      icon: 'swap_horiz',
      label: 'מעבר לפנימייה אחרת',
      color: 'primary',
      handler: (row) => this.openTransferDialog(row),
    },
    {
      icon: 'delete',
      label: 'מחיקה מהמערכת',
      color: 'warn',
      tooltipFn: () => 'מחיקה סופית מהמערכת (לאחר אישור)',
      handler: (row) => this.deleteStudent(row),
    },
  ];

  /** קורא מזהה פנימייה מה-route; אם לא תקין — חזרה לרשימת הפנימיות. */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      void this.router.navigate(['/education-places']);
      return;
    }
    this.educationPlaceId.set(id);
    this.store.load(id);
    void this.loadPlaceName(id);
  }

  /** טוען שם פנימייה לכותרת (לא חובה להצלחת רשימת התלמידים). */
  private async loadPlaceName(educationPlaceId: number): Promise<void> {
    try {
      const place = await this.placesService.getByIdAsync(educationPlaceId);
      this.placeName.set(place.name);
    } catch {
      this.placeName.set(null);
    }
  }

  /** פותח דיאלוג הוספת תלמיד. */
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

  /** דיאלוג עריכה עם נתוני תלמיד קיימים. */
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

  /** דיאלוג בחירת פנימייה להעברת תלמיד. */
  private openTransferDialog(student: StudentDto): void {
    const ref = this.dialog.open<StudentTransferDialogComponent, StudentTransferDialogData, number | undefined>(
      StudentTransferDialogComponent,
      {
        width: '460px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        data: {
          student,
          currentEducationPlaceId: this.educationPlaceId(),
        },
      },
    );
    ref.afterClosed().subscribe((newPlaceId) => {
      const placeId =
        typeof newPlaceId === 'number' ? newPlaceId : Number(newPlaceId);
      if (!Number.isFinite(placeId) || placeId <= 0) {
        return;
      }
      const dto: UpdateStudentDto = {
        id: student.id,
        name: student.name,
        identityNumber: student.identityNumber,
        age: student.age,
        educationPlaceId: placeId,
        isActive: student.isActive,
      };
      void this.store.updateStudent(student.id, dto);
    });
  }

  /** מחיקה לאחר אישור בדיאלוג המערכת (לא window.confirm). */
  private deleteStudent(student: StudentDto): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '420px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        data: {
          title: 'הסרת תלמיד מהמערכת',
          message: `להסיר את "${student.name}" מהמערכת? פנימייה ללא תלמידים תעבור אוטומטית למצב השהייה (אם אינה «לא פעילה»).`,
          confirmLabel: 'הסרה',
          destructive: true,
        },
      },
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) void this.store.deleteStudent(student.id, student.name);
    });
  }

  /** חזרה לרשימת הפנימיות. */
  protected goBack(): void {
    void this.router.navigate(['/education-places']);
  }

  /** איפוס מסנני הרשימה (סטטוס, שם, גיל). */
  protected clearStudentFilters(): void {
    this.store.clearListFilters();
  }

  /** לחיצה על טאב מסירה את מימד הסינון המתאים. */
  protected onStudentFilterTabClick(id: StudentsFilterTabId, event: Event): void {
    event.preventDefault();
    this.store.clearFilterTab(id);
  }

  /** חלונית סינון — סטטוס, שם, גיל — «סינון» מחיל, «ביטול» סוגר בלי שינוי. */
  protected openStudentsFilterDialog(): void {
    const ref = this.dialog.open<
      StudentsFilterDialogComponent,
      StudentsFilterDialogData,
      StudentsListFilters | undefined
    >(StudentsFilterDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: { initial: this.store.studentsFilterSnapshot() },
    });
    ref.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.store.applyListFilters(result);
      }
    });
  }
}
