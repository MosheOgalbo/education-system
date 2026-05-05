/**
 * מצב תלמידים לפי פנימייה. אותם עקרונות כמו EducationPlacesStore:
 * loadSeq למניעת race בין טעינות, async/await לשכבת הרשת, עדכון אופטימיסטי של הרשימה אחרי create/update/delete.
 *
 * סינון תצוגה מקומי: סטטוס, תת־מחרוזת בשם, גיל מדויק — בלי קריאת רשת נוספת.
 *
 * המחלקה: חנות Signals לתלמידים לפי פנימייה נבחרת.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { StudentsService } from '../services/students.service';
import { StudentDto, CreateStudentDto, UpdateStudentDto } from '../../../core/models/student.model';
import {
  StudentsFilterTabDescriptor,
  StudentsFilterTabId,
  StudentsListFilters,
} from '../models/students-list-filter.model';
import { AsyncState, ApiError, initialAsyncState } from '../../../core/models/api-error.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class StudentsStore {
  private readonly service = inject(StudentsService);
  private readonly toast = inject(ToastService);

  private readonly _state = signal<AsyncState<StudentDto[]>>(initialAsyncState([]));
  private readonly _educationPlaceId = signal<number | null>(null);
  private readonly _filterActive = signal<boolean | null>(null);
  private readonly _nameQuery = signal('');
  private readonly _ageFilter = signal<number | null>(null);
  /** מניעת race בין טעינות מהירות. */
  private loadSeq = 0;

  /** סינון תצוגה נוכחי: null = כולם, true/false = פעילים / בהשהייה בלבד. */
  readonly activeFilter = this._filterActive.asReadonly();

  readonly state = this._state.asReadonly();
  readonly isLoading = computed(() => this._state().state === 'loading');
  readonly isError = computed(() => this._state().state === 'error');
  readonly error = computed(() => this._state().error);

  readonly filteredStudents = computed(() => {
    let list = this._state().data;
    const status = this._filterActive();
    if (status !== null) {
      list = list.filter((s) => s.isActive === status);
    }
    const q = this._nameQuery().trim().toLowerCase();
    if (q) {
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    const age = this._ageFilter();
    if (age != null) {
      list = list.filter((s) => s.age === age);
    }
    return list;
  });

  /** מצב סינון לטעינת החלונית. */
  readonly studentsFilterSnapshot = computed(
    (): StudentsListFilters => ({
      status: this._filterActive(),
      nameQuery: this._nameQuery(),
      age: this._ageFilter(),
    }),
  );

  /** תלמידים בפנימייה לפני סינון תצוגה. */
  readonly allStudentsCount = computed(() => this._state().data.length);

  /** האם מוחלים סטטוס / שם / גיל בסינון. */
  readonly hasActiveListFilters = computed(() => {
    if (this._filterActive() !== null) return true;
    if (this._nameQuery().trim().length > 0) return true;
    return this._ageFilter() != null;
  });

  /** טאבים המציגים את המסננים הפעילים (לחיצה בדף מסירה מסנן בודד). */
  readonly filterTabs = computed((): StudentsFilterTabDescriptor[] => {
    const tabs: StudentsFilterTabDescriptor[] = [];
    const st = this._filterActive();
    if (st === true) {
      tabs.push({ id: 'status', label: 'פעילים בלבד' });
    } else if (st === false) {
      tabs.push({ id: 'status', label: 'בהשהייה בלבד' });
    }
    const nq = this._nameQuery().trim();
    if (nq) {
      tabs.push({ id: 'name', label: `שם: ${nq}` });
    }
    const ag = this._ageFilter();
    if (ag != null) {
      tabs.push({ id: 'age', label: `גיל: ${ag}` });
    }
    return tabs;
  });

  readonly activeCount = computed(() => this._state().data.filter((s) => s.isActive).length);
  readonly inactiveCount = computed(() => this._state().data.filter((s) => !s.isActive).length);

  private readonly isSaving = signal(false);
  readonly saving = this.isSaving.asReadonly();

  /** טוען תלמידים לפי מזהה פנימייה. מנקה מסנני רשימה כשעוברים לפנימייה אחרת (מונע מצג שווא / ריק שגוי). */
  load(educationPlaceId: number): void {
    const previous = this._educationPlaceId();
    if (previous !== null && previous !== educationPlaceId) {
      this.clearListFilters();
    }
    void this.performLoad(educationPlaceId);
  }

  /** טעינה חוזרת לאחר שגיאה. */
  retry(): void {
    const id = this._educationPlaceId();
    if (id != null) void this.performLoad(id);
  }

  /** קורא ל-API ומעדכן state; מתעלם מתשובה אם loadSeq השתנה. */
  private async performLoad(educationPlaceId: number): Promise<void> {
    const seq = ++this.loadSeq;
    this._educationPlaceId.set(educationPlaceId);
    this._state.update((s) => ({ ...s, state: 'loading', error: null }));

    try {
      const data = await this.service.getByEducationPlaceAsync(educationPlaceId);
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

  /** סינון תצוגה: null = כולם, true/false = פעילים / לא פעילים בלבד. */
  setActiveFilter(value: boolean | null): void {
    this._filterActive.set(value);
  }

  /** החלה מלאה מהחלונית «סינון תלמידים». */
  applyListFilters(f: StudentsListFilters): void {
    this._filterActive.set(f.status);
    this._nameQuery.set(f.nameQuery);
    this._ageFilter.set(f.age);
  }

  /** איפוס כל מסנני הרשימה (סטטוס, שם, גיל). */
  clearListFilters(): void {
    this._filterActive.set(null);
    this._nameQuery.set('');
    this._ageFilter.set(null);
  }

  /** הסרת מסנן יחיד לפי הטאב. */
  clearFilterTab(id: StudentsFilterTabId): void {
    switch (id) {
      case 'status':
        this._filterActive.set(null);
        break;
      case 'name':
        this._nameQuery.set('');
        break;
      case 'age':
        this._ageFilter.set(null);
        break;
    }
  }

  /** יוצר תלמיד ומוסיף לרשימה המקומית. */
  async createStudent(dto: CreateStudentDto): Promise<void> {
    this.isSaving.set(true);
    try {
      const student = await this.service.createAsync(dto);
      this._state.update((s) => ({ ...s, data: [...s.data, student] }));
      this.toast.success(`התלמיד "${student.name}" נוסף בהצלחה.`);
    } catch {
      /* טוסט שגיאה מטופל ב-interceptor */
    } finally {
      this.isSaving.set(false);
    }
  }

  /** מעדכן תלמיד; אם הועבר לפנימייה אחרת — מסיר מהרשימה הנוכחית. */
  async updateStudent(id: number, dto: UpdateStudentDto): Promise<void> {
    this.isSaving.set(true);
    try {
      const updated = await this.service.updateAsync(id, dto);
      const placeId = this._educationPlaceId();
      if (placeId != null && updated.educationPlaceId !== placeId) {
        this._state.update((s) => ({
          ...s,
          data: s.data.filter((item) => item.id !== id),
        }));
        this.toast.success(`"${updated.name}" הועבר/ה לפנימייה אחרת.`);
      } else {
        this._state.update((s) => ({
          ...s,
          data: s.data.map((item) => (item.id === id ? updated : item)),
        }));
        this.toast.success(`פרטי "${updated.name}" עודכנו.`);
      }
    } catch {
      /* טוסט שגיאה מטופל ב-interceptor */
    } finally {
      this.isSaving.set(false);
    }
  }

  /** מוחק תלמיד ומסיר מהרשימה המקומית. */
  async deleteStudent(id: number, name: string): Promise<void> {
    try {
      await this.service.deleteAsync(id);
      this._state.update((s) => ({
        ...s,
        data: s.data.filter((item) => item.id !== id),
      }));
      this.toast.success(`"${name}" הוסר מהמערכת.`);
    } catch {
      /* טוסט שגיאה מטופל ב-interceptor */
    }
  }
}
