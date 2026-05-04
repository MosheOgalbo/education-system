/**
 * ניהול מצב פנימיות — Signal-based store (ללא NgRx) לפשטות בפרויקט Hands-On.
 *
 * loadSeq: אם המשתמש מחליף מסנן או מרענן מהר, תשובה איטית ישנה לא תדרוס תשובה חדשה.
 *
 * async/await ב-performLoad: קריאות API עוברות דרך *Async בשירות; קל יותר לקרוא ולתחזק ממנויי RxJS
 * ארוכים לטעינה חד-פעמית. שגיאות נזרקות אחרי ה-interceptor כ-ApiError.
 *
 * המחלקה: חנות Signals לרשימת פנימיות, סינון מקומי ופעולות מול ה-API.
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

@Injectable({ providedIn: 'root' })
export class EducationPlacesStore {
  private readonly service = inject(EducationPlacesService);
  private readonly toast = inject(ToastService);

  private readonly _state = signal<AsyncState<EducationPlaceStatsDto[]>>(
    initialAsyncState([]),
  );
  private readonly _searchQuery = signal('');
  private readonly _selectedCityFilter = signal<string | null>(null);
  private readonly _statusFilter = signal<EducationPlaceStatus | null>(null);
  private readonly _totalStudentsFilter = signal<number | null>(null);
  private readonly _activeStudentsFilter = signal<number | null>(null);
  private readonly _averageAgeFilter = signal<number | null>(null);
  private readonly _saving = signal(false);
  /** מונה טעינות — דוחה תשובות ישנות אם הגיעה טעינה חדשה. */
  private loadSeq = 0;

  readonly state = this._state.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedCityFilter = this._selectedCityFilter.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly totalStudentsFilter = this._totalStudentsFilter.asReadonly();
  readonly activeStudentsFilter = this._activeStudentsFilter.asReadonly();
  readonly averageAgeFilter = this._averageAgeFilter.asReadonly();

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
    const status = this._statusFilter();
    const ts = this._totalStudentsFilter();
    const act = this._activeStudentsFilter();
    const av = this._averageAgeFilter();
    const query = this._searchQuery().toLowerCase().trim();

    if (city) {
      items = items.filter((i) => i.city === city);
    }

    if (status) {
      items = items.filter((i) => i.status === status);
    }

    if (ts != null) {
      items = items.filter((i) => i.totalStudentCount === ts);
    }

    if (act != null) {
      items = items.filter((i) => i.activeStudentCount === act);
    }

    if (av != null) {
      items = items.filter((i) => averageAgeMatchesFilter(i.averageAge, av));
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

  /** טאבים המשקפים סינון מובנה פעיל (עיר / סטטוס / טווחים). */
  readonly filterTabs = computed((): EducationPlacesFilterTabDescriptor[] => {
    const tabs: EducationPlacesFilterTabDescriptor[] = [];
    const c = this._selectedCityFilter();
    if (c) {
      tabs.push({ id: 'city', label: c });
    }
    const st = this._statusFilter();
    if (st) {
      tabs.push({ id: 'status', label: educationPlaceStatusLabel(st) });
    }
    const tf = this._totalStudentsFilter();
    if (tf != null) {
      tabs.push({
        id: 'totalStudents',
        label: formatTotalStudentsTab(tf),
      });
    }
    const ac = this._activeStudentsFilter();
    if (ac != null) {
      tabs.push({
        id: 'activeStudents',
        label: formatActiveStudentsTab(ac),
      });
    }
    const af = this._averageAgeFilter();
    if (af != null) {
      tabs.push({
        id: 'averageAge',
        label: formatAverageAgeTab(af),
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
    this._searchQuery.set(query);
  }

  /** סינון לפי עיר נבחרת (לשימוש ישן — מומלץ דרך החלונית). */
  setCityFilter(city: string | null): void {
    this._selectedCityFilter.set(city);
  }

  /** החלה מלאה מהחלונית «סינון». */
  applyStructuredFilters(f: EducationPlacesStructuredFilters): void {
    this._selectedCityFilter.set(f.city);
    this._statusFilter.set(f.status);
    this._totalStudentsFilter.set(f.totalStudents);
    this._activeStudentsFilter.set(f.activeStudents);
    this._averageAgeFilter.set(f.averageAge);
  }

  /** מסיר מימד סינון בודד (מטאב). */
  clearFilterDimension(dim: EducationPlacesFilterDimension): void {
    switch (dim) {
      case 'city':
        this._selectedCityFilter.set(null);
        break;
      case 'status':
        this._statusFilter.set(null);
        break;
      case 'totalStudents':
        this._totalStudentsFilter.set(null);
        break;
      case 'activeStudents':
        this._activeStudentsFilter.set(null);
        break;
      case 'averageAge':
        this._averageAgeFilter.set(null);
        break;
    }
  }

  /** מאפס חיפוש וכל הסינונים. */
  clearFilters(): void {
    this._searchQuery.set('');
    this.resetStructuredFilters();
  }

  /** סינון מובנה בלבד — לטעינת המודל כשמאפסים דרך חיפוש. */
  readonly structuredFiltersSnapshot = computed(
    (): EducationPlacesStructuredFilters => ({
      city: this._selectedCityFilter(),
      status: this._statusFilter(),
      totalStudents: this._totalStudentsFilter(),
      activeStudents: this._activeStudentsFilter(),
      averageAge: this._averageAgeFilter(),
    }),
  );

  private resetStructuredFilters(): void {
    this._selectedCityFilter.set(null);
    this._statusFilter.set(null);
    this._totalStudentsFilter.set(null);
    this._activeStudentsFilter.set(null);
    this._averageAgeFilter.set(null);
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
