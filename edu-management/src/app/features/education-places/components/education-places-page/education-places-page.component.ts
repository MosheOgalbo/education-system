import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { EducationPlacesStore } from '../../store/education-places.store';
import type { EducationPlaceStats } from '../../../../core/models/education-place.model';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import type { GenericColumn } from '../../../../shared/components/generic-table/generic-table.types';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EducationPlaceStatsCardComponent } from '../education-place-stats-card/education-place-stats-card.component';

@Component({
  selector: 'app-education-places-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    GenericTableComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    EducationPlaceStatsCardComponent,
  ],
  templateUrl: './education-places-page.component.html',
  styleUrl: './education-places-page.component.scss',
})
export class EducationPlacesPageComponent implements OnInit {
  private readonly store = inject(EducationPlacesStore);

  readonly places = this.store.places;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly columns: GenericColumn<EducationPlaceStats>[] = [
    { key: 'id', label: 'מזהה' },
    { key: 'name', label: 'שם' },
    { key: 'city', label: 'עיר' },
    { key: 'activeStudentCount', label: 'תלמידים פעילים' },
    {
      key: 'averageAge',
      label: 'גיל ממוצע',
      format: (r) => r.averageAge.toFixed(1),
    },
  ];

  ngOnInit(): void {
    this.store.load();
  }

  retry(): void {
    this.store.load();
  }
}
