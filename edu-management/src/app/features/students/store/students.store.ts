/**
 * מצב תלמידים לפי פנימייה. אותם עקרונות כמו EducationPlacesStore:
 * loadSeq למניעת race בין טעינות, async/await לשכבת הרשת, עדכון אופטימיסטי של הרשימה אחרי create/update/delete.
 *
 * סינון פעיל/לא פעיל נעשה ב-computed מקומי כדי לא לפגוע בנתונים שכבר נטענו מהשרת.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { StudentsService } from '../services/students.service';
import { StudentDto, CreateStudentDto, UpdateStudentDto } from '../../../core/models/student.model';
import { AsyncState, ApiError, initialAsyncState } from '../../../core/models/api-error.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class StudentsStore {
  private readonly service = inject(StudentsService);
  private readonly toast = inject(ToastService);

  private readonly _state = signal<AsyncState<StudentDto[]>>(initialAsyncState([]));
  private readonly _educationPlaceId = signal<number | null>(null);
  private readonly _filterActive = signal<boolean | null>(null);
  private loadSeq = 0;

  readonly state = this._state.asReadonly();
  readonly isLoading = computed(() => this._state().state === 'loading');
  readonly isError = computed(() => this._state().state === 'error');
  readonly error = computed(() => this._state().error);

  readonly filteredStudents = computed(() => {
    const filter = this._filterActive();
    const all = this._state().data;
    if (filter === null) return all;
    return all.filter((s) => s.isActive === filter);
  });

  readonly activeCount = computed(() => this._state().data.filter((s) => s.isActive).length);
  readonly inactiveCount = computed(() => this._state().data.filter((s) => !s.isActive).length);

  private readonly isSaving = signal(false);
  readonly saving = this.isSaving.asReadonly();

  load(educationPlaceId: number): void {
    void this.performLoad(educationPlaceId);
  }

  retry(): void {
    const id = this._educationPlaceId();
    if (id != null) void this.performLoad(id);
  }

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

  setActiveFilter(value: boolean | null): void {
    this._filterActive.set(value);
  }

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

  async updateStudent(id: number, dto: UpdateStudentDto): Promise<void> {
    this.isSaving.set(true);
    try {
      const updated = await this.service.updateAsync(id, dto);
      this._state.update((s) => ({
        ...s,
        data: s.data.map((item) => (item.id === id ? updated : item)),
      }));
      this.toast.success(`פרטי "${updated.name}" עודכנו.`);
    } catch {
      /* טוסט שגיאה מטופל ב-interceptor */
    } finally {
      this.isSaving.set(false);
    }
  }

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
