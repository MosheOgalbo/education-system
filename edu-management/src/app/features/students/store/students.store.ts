import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap } from 'rxjs';
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

  private readonly load$ = new Subject<number>();
  private readonly isSaving = signal(false);
  readonly saving = this.isSaving.asReadonly();

  constructor() {
    this.load$
      .pipe(
        tap((id) => {
          this._educationPlaceId.set(id);
          this._state.update((s) => ({ ...s, state: 'loading', error: null }));
        }),
        switchMap((id) =>
          this.service.getByEducationPlace(id).pipe(
            tap({
              next: (data) => this._state.set({ data, state: 'success', error: null }),
              error: (err: ApiError) =>
                this._state.update((s) => ({ ...s, state: 'error', error: err })),
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  load(educationPlaceId: number): void {
    this.load$.next(educationPlaceId);
  }

  retry(): void {
    const id = this._educationPlaceId();
    if (id != null) this.load$.next(id);
  }

  setActiveFilter(value: boolean | null): void {
    this._filterActive.set(value);
  }

  async createStudent(dto: CreateStudentDto): Promise<void> {
    this.isSaving.set(true);
    this.service.create(dto).subscribe({
      next: (student) => {
        this._state.update((s) => ({ ...s, data: [...s.data, student] }));
        this.toast.success(`Student "${student.name}" added successfully.`);
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false),
    });
  }

  updateStudent(id: number, dto: UpdateStudentDto): void {
    this.isSaving.set(true);
    this.service.update(id, dto).subscribe({
      next: (updated) => {
        this._state.update((s) => ({
          ...s,
          data: s.data.map((item) => (item.id === id ? updated : item)),
        }));
        this.toast.success(`Student "${updated.name}" updated.`);
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false),
    });
  }

  deleteStudent(id: number, name: string): void {
    this.service.delete(id).subscribe({
      next: () => {
        this._state.update((s) => ({
          ...s,
          data: s.data.filter((item) => item.id !== id),
        }));
        this.toast.success(`"${name}" removed.`);
      },
    });
  }
}
