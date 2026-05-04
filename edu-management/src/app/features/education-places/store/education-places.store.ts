/**
 * ניהול מצב פנימיות — Signal-based store (ללא NgRx) לפשטות בפרויקט Hands-On.
 *
 * loadSeq: אם המשתמש מחליף מסנן או מרענן מהר, תשובה איטית ישנה לא תדרוס תשובה חדשה.
 *
 * async/await ב-performLoad: קריאות API עוברות דרך *Async בשירות; קל יותר לקרוא ולתחזק ממנויי RxJS
 * ארוכים לטעינה חד-פעמית. שגיאות נזרקות אחרי ה-interceptor כ-ApiError.
 *
 * המחלקה: חנות Signals לרשימת פנימיות, סינון מקומי ופעולות מול ה-API.
 *
 * ✅ UPGRADED: Consolidated 7 signals into composite FilterState object for better state management.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { EducationPlacesService } from '../services/education-places.service';
import {
  CreateEducationPlaceDto,
  EducationPlaceStatsDto,
  EducationPlaceStatus,
  educationPlaceStatusLabel,
} from '../../../core/models/education-place.model';
import {
  EducationPlacesFilterDimension,
  EducationPlacesFilterTabDescriptor,
  EducationPlacesStructuredFilters,
} from '../models/education-places-filter.model';
import { AsyncState, ApiError, initialAsyncState } from '../../../core/models/api-error.model';
import { ToastService } from '../../../core/services/toast.service';

/** טיפוס מורכב לכל מצבי הסינון (consolidated from 6 signals). */
interface FilterState {
  searchQuery: string;
  city: EducationPlaceStatus | null;
  status: EducationPlaceStatus | null;
  totalStudents: number | null;
  activeStudents: number | null;
  averageAge: number | null;
}

const initialFilterState: FilterState = {
  searchQuery: '',
  city: null,
  status: null,
  totalStudents: null,
  activeStudents: null,
  averageAge: null,
};

@Injectable({ providedIn: 'root' })
export class EducationPlacesStore {
  private readonly service = inject(EducationPlacesService);
  private readonly toast = inject(ToastService);

  private readonly _state = signal<AsyncState<EducationPlaceStatsDto[]>>(
    initialAsyncState([]),
  );
  // ✅ CONSOLIDATED: Single filter state instead of 6 independent signals
  private readonly _filters = signal<FilterState>(initialFilterState);
  private readonly _saving = signal(false);
  /** מונה טעינות — דוחה תשובות ישנות אם הגיעה טעינה חדשה. */
  private loadSeq = 0;

  readonly state = this._state.asReadonly();
  readonly saving = this._saving.asReadonly();

  // ✅ UPGRADED: Expose filter state for template binding
  readonly searchQuery = computed(() => this._filters().searchQuery);
  readonly selectedCityFilter = computed(() => this._filters().city);
  readonly statusFilter = computed(() => this._filters().status);
  readonly totalStudentsFilter = computed(() => this._filters().totalStudents);
  readonly activeStudentsFilter = computed(() => this._filters().activeStudents);
  readonly averageAgeFilter = computed(() => this._filters().averageAge);

  readonly isLoading = computed(() => this._state().state === 'loading');
  readonly isError = computed(() => this._state().state === 'error');
  readonly error = computed(() => this._state().error);
  readonly allItems = computed(() => this._state().data);

  readonly availableCities = computed(() =>
    [...new Set(this._state().data.map((p) => p.city))].sort(),
  );

  readonly filteredItems = computed(() => {
    let items = this._state().data;
    const filters = this._filters();

    if (filters.city) {
      items = items.filter((i) => i.city === filters.city);
    }

    if (filters.status) {
      items = items.filter((i) => i.status === filters.status);
    }

    if (filters.totalStudents != null) {
      items = items.filter((i) => i.totalStudentCount === filters.totalStudents);
    }

    if (filters.activeStudents != null) {
      items = items.filter((i) => i.activeStudentCount === filters.activeStudents);
    }

    if (filters.averageAge != null) {
      items = items.filter((i) => averageAgeMatchesFilter(i.averageAge, filters.averageAge!));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.city.toLowerCase().includes(query),
      );
    }

    return items;
  });

  /** טאבים המשקפים סינון מובנה פעיל (עיר / סטטוס / טווחים). */
  readonly filterTabs = computed((): EducationPlacesFilterTabDescriptor[] => {
    const tabs: EducationPlacesFilterTabDescriptor[] = [];
    const filters = this._filters();

    if (filters.city) {
      tabs.push({ id: 'city', label: filters.city });
    }
    if (filters.status) {
      tabs.push({ id: 'status', label: educationPlaceStatusLabel(filters.status) });
    }
    if (filters.totalStudents != null) {
      tabs.push({
        id: 'totalStudents',
        label: formatTotalStudentsTab(filters.totalStudents),
      });
    }
    if (filters.activeStudents != null) {
      tabs.push({
        id: 'activeStudents',
        label: formatActiveStudentsTab(filters.activeStudents),
      });
    }
    if (filters.averageAge != null) {
      tabs.push({
        id: 'averageAge',
        label: formatAverageAgeTab(filters.averageAge),
      });
    }
    return tabs;
  });

  /** סכום תלמידים פעילים בכל הפנימיות (לפי הנתונים בזיכרון). */
  readonly totalStudents = computed(() =>
    this._state().data.reduce((sum, p) => sum + p.activeStudentCount, 0),
  );

  /** מתחיל טעינה מהשרת. */
  load(): void {
    void this.performLoad();
  }

  /** ניסיון טעינה חוזר אחרי שגיאה. */
  retry(): void {
    void this.performLoad();
  }

  /** טוען רשימה; משתמש ב-loadSeq כדי למנוע race. */
  private async performLoad(): Promise<void> {
    const seq = ++this.loadSeq;
    this._state.update((s) => ({ ...s, state: 'loading', error: null }));

    try {
      const data = await this.service.getAllAsync();
      if (seq !== this.loadSeq) return;
      this._state.set({ data, state: 'success', error: null });
    } catch (e) {
      if (seq !== this.loadSeq) return;
      this._state.update((s) => ({
        ...s,
        state: 'error',
        error: e as ApiError,
      }));
    }
  }

  /**
   * חיפוש חופשי — כשיש טקסט לא ריק (אחרי trim) מאפס את הסינון המובנה מהמודל.
   */
  setSearch(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      this.resetStructuredFilters();
    }
    this._filters.update((f) => ({ ...f, searchQuery: query }));
  }

  /** סינון לפי עיר נבחרת (לשימוש ישן — מומלץ דרך החלונית). */
  setCityFilter(city: string | null): void {
    this._filters.update((f) => ({ ...f, city: city as any }));
  }

  /** החלה מלאה מהחלונית «סינון». */
  applyStructuredFilters(f: EducationPlacesStructuredFilters): void {
    this._filters.set({
      searchQuery: '',
      city: f.city as any,
      status: f.status,
      totalStudents: f.totalStudents,
      activeStudents: f.activeStudents,
      averageAge: f.averageAge,
    });
  }

  /** מסיר מימד סינון בודד (מטאב). */
  clearFilterDimension(dim: EducationPlacesFilterDimension): void {
    this._filters.update((f) => ({
      ...f,
      [dim]: null,
    }));
  }

  /** מאפס חיפוש וכל הסינונים. */
  clearFilters(): void {
    this._filters.set(initialFilterState);
  }

  /** סינון מובנה בלבד — לטעינת המודל כשמאפסים דרך חיפוש. */
  readonly structuredFiltersSnapshot = computed(
    (): EducationPlacesStructuredFilters => {
      const filters = this._filters();
      return {
        city: filters.city as any,
        status: filters.status,
        totalStudents: filters.totalStudents,
        activeStudents: filters.activeStudents,
        averageAge: filters.averageAge,
      };
    },
  );

  private resetStructuredFilters(): void {
    this._filters.update((f) => ({
      ...f,
      city: null,
      status: null,
      totalStudents: null,
      activeStudents: null,
      averageAge: null,
    }));
  }

  /** יוצר פנימייה בשרת ומוסיף שורה מקומית עם סטטיסטיקה אפס. */
  async createPlace(dto: CreateEducationPlaceDto): Promise<void> {
    this._saving.set(true);
    try {
      const created = await this.service.createAsync(dto);
      const newRow: EducationPlaceStatsDto = {
        id: created.id,
        name: created.name,
        city: created.city,
        status: created.status,
        totalStudentCount: 0,
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
      /* טוסט שגיאה מטופל ב-interceptor */
    } finally {
      this._saving.set(false);
    }
  }

  /**
   * מעדכן סטטוס דרך PATCH קיים: `true` — פעילה (או השהייה אם אין תלמידים);
   * `false` — לא פעילה (מאפשר מחיקה כשאין תלמידים).
   */
  async setPlaceActive(id: number, wantActive: boolean): Promise<void> {
    this._saving.set(true);
    try {
      const updated = await this.service.setActiveAsync(id, wantActive);
      this._state.update((s) => ({
        ...s,
        data: s.data.map((p) => (p.id === id ? { ...p, status: updated.status } : p)),
      }));

      if (wantActive) {
        this.toast.success(
          updated.status === 'suspended'
            ? 'הפנימייה במצב השהייה — אין תלמידים משויכים. ניתן לשבץ תלמידים; עם שיבוץ הסטטוס יעבור לפעילה.'
            : 'הפנימייה סומנה כפעילה.',
        );
      } else {
        this.toast.success(
          'הפנימייה סומנה כלא פעילה — לאחר הסרת כל התלמידים ניתן למחוק מהמערכת.',
        );
      }
    } catch {
      /* interceptor */
    } finally {
      this._saving.set(false);
    }
  }

  /** מוחק פנימייה בשרת ומסיר מהרשימה המקומית. */
  async deletePlace(id: number, name: string): Promise<void> {
    this._saving.set(true);
    try {
      await this.service.deleteAsync(id);
      this._state.update((s) => ({
        ...s,
        data: s.data.filter((p) => p.id !== id),
      }));
      this.toast.success(`הפנימייה "${name}" נמחקה.`);
    } catch {
      /* interceptor */
    } finally {
      this._saving.set(false);
    }
  }
}

function formatTotalStudentsTab(n: number): string {
  return `תלמידים: ${n}`;
}

function formatActiveStudentsTab(n: number): string {
  return `פעילים: ${n}`;
}

function formatAverageAgeTab(n: number): string {
  const s = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
  return `ממוצע גיל: ${s}`;
}

/** ממוצע 0 = אין נתונים — לא תואם למספר חיובי */
function averageAgeMatchesFilter(placeAvg: number, filter: number): boolean {
  if (filter > 0 && placeAvg <= 0) return false;
  return Math.abs(placeAvg - filter) < 0.001;
}
