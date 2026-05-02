import { Component, OnInit, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

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

  protected readonly columns: ColumnDef<EducationPlaceStatsDto>[] = [
    { key: 'name', label: 'שם פנימייה', sortable: true },
    { key: 'city', label: 'עיר', sortable: true },
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
      icon: 'group',
      label: 'צפייה בתלמידים',
      color: 'primary',
      handler: (row) => this.navigateToStudents(row),
    },
  ];

  protected navigateToStudents(row: EducationPlaceStatsDto): void {
    void this.router.navigate(['/education-places', row.id, 'students']);
  }

  protected readonly hasActiveFilters = computed(
    () => !!this.store.searchQuery() || !!this.store.selectedCityFilter(),
  );

  ngOnInit(): void {
    this.store.load();
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
      { width: '440px', autoFocus: 'first-tabbable' },
    );
    ref.afterClosed().subscribe((result) => {
      if (result) void this.store.createPlace(result);
    });
  }
}
