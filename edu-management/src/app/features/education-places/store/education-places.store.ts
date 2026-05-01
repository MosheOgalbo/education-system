import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, from, switchMap, tap } from 'rxjs';
import { EducationPlacesService } from '../services/education-places.service';
import {
  CreateEducationPlaceDto,
  EducationPlaceStatsDto,
} from '../../../core/models/education-place.model';
import { AsyncState, ApiError, initialAsyncState } from '../../../core/models/api-error.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class EducationPlacesStore {
  private readonly service = inject(EducationPlacesService);
  private readonly toast = inject(ToastService);

  // ── Private writable signals ─────────────────────────────────────────
  private readonly _state = signal<AsyncState<EducationPlaceStatsDto[]>>(
    initialAsyncState([]),
  );
  private readonly _searchQuery = signal('');
  private readonly _selectedCityFilter = signal<string | null>(null);
  private readonly _saving = signal(false);

  // ── Public readonly signals ───────────────────────────────────────────
  readonly state = this._state.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedCityFilter = this._selectedCityFilter.asReadonly();

  // ── Computed derived state ────────────────────────────────────────────
  readonly isLoading = computed(() => this._state().state === 'loading');
  readonly isError = computed(() => this._state().state === 'error');
  readonly error = computed(() => this._state().error);
  readonly allItems = computed(() => this._state().data);

  readonly availableCities = computed(() =>
    [...new Set(this._state().data.map((p) => p.city))].sort(),
  );

  readonly filteredItems = computed(() => {
    let items = this._state().data;
    const city = this._selectedCityFilter();
    const query = this._searchQuery().toLowerCase().trim();

    if (city) {
      items = items.filter((i) => i.city === city);
    }

    if (query) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.city.toLowerCase().includes(query),
      );
    }

    return items;
  });

  readonly totalStudents = computed(() =>
    this._state().data.reduce((sum, p) => sum + p.activeStudentCount, 0),
  );

  // ── Load trigger (for retry support) ─────────────────────────────────
  private readonly load$ = new Subject<void>();

  constructor() {
    // Wire load$ trigger → HTTP call → state update
    this.load$
      .pipe(
        tap(() =>
          this._state.update((s) => ({ ...s, state: 'loading', error: null })),
        ),
        switchMap(() =>
          from(this.service.getAllAsync()).pipe(
            tap({
              next: (data) =>
                this._state.set({ data, state: 'success', error: null }),
              error: (err: ApiError) =>
                this._state.update((s) => ({
                  ...s,
                  state: 'error',
                  error: err,
                })),
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // ── Actions ───────────────────────────────────────────────────────────
  load(): void {
    this.load$.next();
  }

  retry(): void {
    this.load$.next();
  }

  setSearch(query: string): void {
    this._searchQuery.set(query);
  }

  setCityFilter(city: string | null): void {
    this._selectedCityFilter.set(city);
  }

  clearFilters(): void {
    this._searchQuery.set('');
    this._selectedCityFilter.set(null);
  }

  async createPlace(dto: CreateEducationPlaceDto): Promise<void> {
    this._saving.set(true);
    try {
      const created = await this.service.createAsync(dto);
      const newRow: EducationPlaceStatsDto = {
        id: created.id,
        name: created.name,
        city: created.city,
        activeStudentCount: 0,
        averageAge: 0,
      };
      this._state.update((s) => ({
        ...s,
        data: [...s.data, newRow].sort((a, b) =>
          a.name.localeCompare(b.name, 'he', { numeric: true }),
        ),
      }));
      this.toast.success(`הפנימייה "${created.name}" נוספה בהצלחה.`);
    } catch {
      /* interceptor + toast */
    } finally {
      this._saving.set(false);
    }
  }
}
