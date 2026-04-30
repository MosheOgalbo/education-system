import { Injectable, inject, signal } from '@angular/core';

import type { Student } from '../../../core/models/student.model';
import { StudentsService } from '../services/students.service';

@Injectable({ providedIn: 'root' })
export class StudentsStore {
  private readonly api = inject(StudentsService);

  readonly students = signal<Student[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filterPlaceId = signal<number | null>(null);

  setFilterPlaceId(id: number | null): void {
    this.filterPlaceId.set(id);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const place = this.filterPlaceId();
    this.api.getAll(place ?? undefined).subscribe({
      next: (rows) => {
        this.students.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('לא ניתן לטעון את רשימת התלמידים.');
        this.loading.set(false);
      },
    });
  }

  removeLocal(id: number): void {
    this.students.update((list) => list.filter((s) => s.id !== id));
  }

  upsertLocal(row: Student): void {
    this.students.update((list) => {
      const i = list.findIndex((s) => s.id === row.id);
      if (i === -1) {
        return [...list, row].sort((a, b) => a.name.localeCompare(b.name, 'he'));
      }
      const next = [...list];
      next[i] = row;
      return next;
    });
  }
}
