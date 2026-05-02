/**
 * דף פנימיות — החלטות מוצר (לראיון):
 *
 * - BreakpointObserver (768px): במובייל כרטיסיות במקום טבלה — קריאותיות טובה יותר מטבלה צפופה.
 * - פעולות בתפריט: פחות misclick מול ניווט לתלמידים; טקסט דינמי ל-toggle פעילות דורש labelFn ב-TableAction.
 * - עמודות ממורכזות: עקביות ויזואלית לנתוני ניהול (מספרים, סטטוס).
 */
import { Component, OnInit, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

import { EducationPlacesStore } from '../../store/education-places.store';
import { CreateEducationPlaceDto } from '../../../../core/models/education-place.model';
import { EducationPlaceFormDialogComponent } from '../education-place-form-dialog/education-place-form-dialog.component';
import { EducationPlaceStatsDto } from '../../../../core/models/education-place.model';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { AutocompleteInputComponent } from '../../../../shared/components/autocomplete-input/autocomplete-input.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import {
  ColumnDef,
  TableAction,
} from '../../../../shared/components/generic-table/generic-table.types';

@Component({
  selector: 'app-education-places-page',
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
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
export class EducationPlacesPageComponent implements OnInit {
  protected readonly store = inject(EducationPlacesStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly breakpoint = inject(BreakpointObserver);

  /** מסכים צרים: כרטיסיות במקום טבלה */
  protected readonly isCompactLayout = toSignal(
    this.breakpoint.observe('(max-width: 768px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly columns: ColumnDef<EducationPlaceStatsDto>[] = [
    { key: 'name', label: 'שם פנימייה', sortable: true, align: 'center' },
    { key: 'city', label: 'עיר', sortable: true, align: 'center' },
    {
      key: 'isActive',
      label: 'סטטוס',
      sortable: true,
      align: 'center',
      render: (row) => (row.isActive ? 'פעילה' : 'לא פעילה'),
      cellClass: (row) => (row.isActive ? 'status--active' : 'status--inactive'),
    },
    {
      key: 'activeStudentCount',
      label: 'תלמידים פעילים',
      sortable: true,
      align: 'center',
      render: (row) => `${row.activeStudentCount}`,
    },
    {
      key: 'averageAge',
      label: 'גיל ממוצע',
      sortable: true,
      align: 'center',
      render: (row) => (row.averageAge > 0 ? row.averageAge.toFixed(1) : '—'),
    },
  ];

  protected readonly actions: TableAction<EducationPlaceStatsDto>[] = [
    {
      icon: 'school',
      label: 'ניהול פנימייה',
      handler: (row) => this.navigateToStudents(row),
    },
    {
      icon: 'toggle_on',
      iconFn: (row) => (row.isActive ? 'toggle_off' : 'toggle_on'),
      label: '',
      labelFn: (row) =>
        row.isActive ? 'מעבר לפנימייה לא פעילה' : 'הפיכת פנימייה לפעילה',
      handler: (row) => this.togglePlaceActive(row),
    },
    {
      icon: 'delete',
      label: 'מחיקת פנימייה',
      color: 'warn',
      handler: (row) => this.confirmDeletePlace(row),
    },
  ];

  protected readonly rowClassFn = (row: EducationPlaceStatsDto) =>
    !row.isActive ? 'data-row--inactive' : '';

  protected readonly hasActiveFilters = computed(
    () => !!this.store.searchQuery() || !!this.store.selectedCityFilter(),
  );

  ngOnInit(): void {
    this.store.load();
  }

  protected navigateToStudents(row: EducationPlaceStatsDto): void {
    void this.router.navigate(['/education-places', row.id, 'students']);
  }

  protected togglePlaceActive(row: EducationPlaceStatsDto): void {
    void this.store.setPlaceActive(row.id, !row.isActive);
  }

  protected confirmDeletePlace(row: EducationPlaceStatsDto): void {
    if (
      confirm(
        `למחוק את הפנימייה "${row.name}"? לא ניתן למחוק אם יש תלמידים משויכים.`,
      )
    ) {
      void this.store.deletePlace(row.id, row.name);
    }
  }

  protected onSearchChange(query: string): void {
    this.store.setSearch(query);
  }

  protected onCitySelect(city: string | null): void {
    this.store.setCityFilter(city);
  }

  protected onClearFilters(): void {
    this.store.clearFilters();
  }

  protected openCreateDialog(): void {
    const ref = this.dialog.open<EducationPlaceFormDialogComponent, void, CreateEducationPlaceDto | undefined>(
      EducationPlaceFormDialogComponent,
      { width: '440px', maxWidth: '95vw', autoFocus: 'first-tabbable' },
    );
    ref.afterClosed().subscribe((result) => {
      if (result) void this.store.createPlace(result);
    });
  }
}
