import { Injectable, inject, signal } from '@angular/core';

import type { EducationPlaceStats } from '../../../core/models/education-place.model';
import { EducationPlacesService } from '../services/education-places.service';

@Injectable({ providedIn: 'root' })
export class EducationPlacesStore {
  private readonly api = inject(EducationPlacesService);

  readonly places = signal<EducationPlaceStats[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: (rows) => {
        this.places.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('לא ניתן לטעון את רשימת הפנימיות.');
        this.loading.set(false);
      },
    });
  }
}
