/**
 * דף ניהול פנימיות: טבלה/כרטיסיות (breakpoint 768px), חיפוש וסינון עיר, דיאלוג הוספה, פעולות שורה.
 * BreakpointObserver — במובייל כרטיסיות במקום טבלה. תפריט פעולות מפחית לחיצות שגויות; `labelFn` לטקסט דינמי לפי סטטוס (פעילה / השהייה / לא פעילה).
 */
import { Component, ChangeDetectionStrategy, DestroyRef, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

import { EducationPlacesStore } from '../../store/education-places.store';
import {
  CreateEducationPlaceDto,
  EducationPlaceStatsDto,
  educationPlaceStatusLabel,
  educationPlaceStatusCellClass,
  educationPlaceDataRowClass,
} from '../../../../core/models/education-place.model';
import { EducationPlaceFormDialogComponent } from '../education-place-form-dialog/education-place-form-dialog.component';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { AutocompleteInputComponent } from '../../../../shared/components/autocomplete-input/autocomplete-input.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import {
  ColumnDef,
  TableAction,
} from '../../../../shared/components/generic-table/generic-table.types';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  EducationPlacesFilterDialogComponent,
  EducationPlacesFilterDialogData,
} from '../education-places-filter-dialog/education-places-filter-dialog.component';
import {
  EducationPlacesFilterDimension,
  EducationPlacesStructuredFilters,
} from '../../models/education-places-filter.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-education-places-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    GenericTableComponent,
    AutocompleteInputComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './education-places-page.component.html',
  styleUrl: './education-places-page.component.scss',
})
export class EducationPlacesPageComponent {
  protected readonly store = inject(EducationPlacesStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** מתחת ל-768px — תצוגת כרטיסיות במקום טבלה. */
  protected readonly isCompactLayout = toSignal(
    this.breakpoint.observe('(max-width: 768px)').pipe(
      map((r) => r.matches),
      takeUntilDestroyed(),
    ),
    { initialValue: false },
  );

  constructor() {
    // טוען רשימת פנימיות בעת בנייה (החלף OnInit)
    this.store.load();
  }

  /** עמודות הטבלה: שם, עיר, סטטוס, מספרים, גיל ממוצע. */
  protected readonly columns: ColumnDef<EducationPlaceStatsDto>[] = [
    { key: 'name', label: 'שם פנימייה', sortable: true, align: 'center' },
    { key: 'city', label: 'עיר', sortable: true, align: 'center' },
    {
      key: 'status',
      label: 'סטטוס',
      sortable: true,
      align: 'center',
      render: (row) => educationPlaceStatusLabel(row.status),
      cellClass: (row) => educationPlaceStatusCellClass(row.status),
    },
    {
      key: 'activeStudentCount',
      label: 'תלמידים פעילים',
      sortable: true,
      align: 'center',
      render: (row) => `${row.activeStudentCount}`,
    },
    {
      key: 'totalStudentCount',
      label: 'סה״כ משויכים',
      sortable: true,
      align: 'center',
      render: (row) => `${row.totalStudentCount}`,
    },
    {
      key: 'averageAge',
      label: 'ממוצע גיל (כולל)',
      sortable: true,
      align: 'center',
      render: (row) => (row.averageAge > 0 ? row.averageAge.toFixed(1) : '—'),
    },
  ];

  /** תפריט פעולות לשורה: תלמידים, מעבר לפעילה/לא פעילה, מחיקה (רק בלא פעילה). */
  protected readonly actions: TableAction<EducationPlaceStatsDto>[] = [
    {
      icon: 'school',
      label: 'ניהול פנימייה',
      handler: (row) => this.navigateToStudents(row),
    },
    {
      icon: 'toggle_on',
      iconFn: (row) => (row.status === 'inactive' ? 'toggle_on' : 'toggle_off'),
      label: '',
      labelFn: (row) =>
        row.status === 'inactive'
          ? 'הפעלה מחדש (פעילה או השהייה אם אין תלמידים)'
          : 'מעבר ל«לא פעילה» (נדרש לפני מחיקה)',
      tooltipFn: (row) => this.togglePlaceTooltip(row),
      handler: (row) => this.togglePlaceActive(row),
    },
    {
      icon: 'delete',
      label: 'מחיקת פנימייה',
      color: 'warn',
      tooltipFn: (row) => this.deleteBlockedReason(row) ?? 'מחיקה סופית מהמערכת',
      handler: (row) => this.confirmDeletePlace(row),
    },
  ];

  protected readonly rowClassFn = (row: EducationPlaceStatsDto) => educationPlaceDataRowClass(row.status);

  /** חיפוש טקסט או סינון מהמודל (טאבים). */
  protected readonly hasActiveFilters = computed(
    () =>
      !!this.store.searchQuery().trim() || this.store.filterTabs().length > 0,
  );

  protected placeStatusLabel(row: EducationPlaceStatsDto): string {
    return educationPlaceStatusLabel(row.status);
  }


  /** ניווט לדף תלמידים של הפנימייה. */
  protected navigateToStudents(row: EducationPlaceStatsDto): void {
    void this.router.navigate(['/education-places', row.id, 'students']);
  }

  /** הסבר לפעולת המתג — כולל חסימה כשיש תלמידים ומעבר ל«לא פעילה». */
  protected togglePlaceTooltip(row: EducationPlaceStatsDto): string {
    const n = Number(row.totalStudentCount);
    if (row.status !== 'inactive' && n > 0) {
      return 'לא ניתן להעביר ל«לא פעילה» כל עוד יש תלמידים משויכים — העבירו או הסירו תלמידים תחילה.';
    }
    return row.status === 'inactive'
      ? 'הפעלה מחדש — פעילה או בהשהייה אם אין תלמידים'
      : 'מעבר ל«לא פעילה» (נדרש לפני מחיקה)';
  }

  /** מעבר לפעילה (או השהייה) / ללא פעילה — לפי סטטוס נוכחי. */
  protected togglePlaceActive(row: EducationPlaceStatsDto): void {
    const wantActive = row.status === 'inactive';
    const total = Number(row.totalStudentCount);
    if (!wantActive && total > 0) {
      this.toast.error(
        'לא ניתן להעביר פנימייה למצב «לא פעילה» כל עוד קיימים תלמידים משויכים לה. יש להעביר או להסיר את התלמידים תחילה.',
      );
      return;
    }
    void this.store.setPlaceActive(row.id, wantActive);
  }

  /** אייקון בתפריט מובייל לפי סטטוס. */
  protected toggleIcon(row: EducationPlaceStatsDto): string {
    return row.status === 'inactive' ? 'toggle_on' : 'toggle_off';
  }

  protected toggleLabel(row: EducationPlaceStatsDto): string {
    return row.status === 'inactive'
      ? 'הפעלה מחדש (פעילה / השהייה)'
      : 'מעבר ל«לא פעילה»';
  }

  /**
   * סיבת חסימת מחיקה — תואם לבקאנד: לא במצב «לא פעילה», או עם תלמידים משויכים.
   * סטטוס השהייה מנוסח במפורש למודל משוב משתמש.
   */
  protected deleteBlockedReason(row: EducationPlaceStatsDto): string | null {
    if (row.status === 'active' || row.status === 'suspended') {
      if (row.status === 'suspended') {
        return (
          'לא ניתן למחוק פנימייה במצב «השהייה». יש להעביר תחילה למצב «לא פעילה» («מעבר ללא פעילה» בתפריט הפעולות). ' +
          'לאחר מכן, כשאין תלמידים משויכים — ניתן למחוק.'
        );
      }
      return (
        'לא ניתן למחוק פנימייה במצב «פעילה». יש להעביר תחילה למצב «לא פעילה» ' +
        'בתפריט הפעולות; לאחר מכן, כשאין תלמידים משויכים — ניתן למחוק.'
      );
    }
    if (row.totalStudentCount > 0) {
      return (
        'לא ניתן למחוק פנימייה שיש לה תלמידים משויכים. ' +
        'יש להסיר או להעביר את כל התלמידים לפני המחיקה.'
      );
    }
    return null;
  }

  /** מחיקה לאחר אישור בדיאלוג; אם הפעולה חסומה — מודל עם הסיבה (לא ניתן לאשר מחיקה). */
  protected confirmDeletePlace(row: EducationPlaceStatsDto): void {
    const blocked = this.deleteBlockedReason(row);
    if (blocked) {
      this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        width: '420px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        data: {
          title: 'לא ניתן למחוק',
          message: blocked,
          alertOnly: true,
          warningHeader: true,
          confirmLabel: 'סגירה',
        },
      });
      return;
    }

    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '420px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        data: {
          title: 'מחיקת פנימייה',
          message: `למחוק את "${row.name}" מהמערכת? הפעולה סופית.`,
          confirmLabel: 'מחיקה',
          destructive: true,
        },
      },
    );
    ref.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) void this.store.deletePlace(row.id, row.name);
      });
  }

  /** עדכון מילת חיפוש ב-store. */
  protected onSearchChange(query: string): void {
    this.store.setSearch(query);
  }

  /** לחיצה על טאב מסירה את מימד הסינון המתאים. */
  protected onFilterTabClick(id: EducationPlacesFilterDimension, event: Event): void {
    event.preventDefault();
    this.store.clearFilterDimension(id);
  }

  /** איפוס חיפוש ועיר. */
  protected onClearFilters(): void {
    this.store.clearFilters();
  }

  /** דיאלוג יצירת פנימייה חדשה. */
  protected openCreateDialog(): void {
    const ref = this.dialog.open<EducationPlaceFormDialogComponent, void, CreateEducationPlaceDto | undefined>(
      EducationPlaceFormDialogComponent,
      { width: '440px', maxWidth: '95vw', autoFocus: 'first-tabbable' },
    );
    ref.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) void this.store.createPlace(result);
      });
  }

  /** חלונית סינון — «סינון» מחיל מסננים מובנים; חיפוש נשאר בשדה הנפרד. */
  protected openPlacesFilterDialog(): void {
    const ref = this.dialog.open<
      EducationPlacesFilterDialogComponent,
      EducationPlacesFilterDialogData,
      EducationPlacesStructuredFilters | undefined
    >(EducationPlacesFilterDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        cities: this.store.availableCities(),
        initial: this.store.structuredFiltersSnapshot(),
      },
    });
    ref.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.store.applyStructuredFilters(result);
        }
      });
  }
}
