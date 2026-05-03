/**
 * שירות HTTP ל-`/api/EducationPlaces`.
 * Observable לשימוש ריאקטיבי; שיטות `*Async` עם `firstValueFrom` ל-async/await ב-store ובדיאלוגים.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import {
  EducationPlaceStatsDto,
  EducationPlaceDto,
  CreateEducationPlaceDto,
  UpdateEducationPlaceDto,
} from '../../../core/models/education-place.model';

@Injectable({ providedIn: 'root' })
export class EducationPlacesService {
  private readonly http = inject(HttpClient);

  /** רשימת כל הפנימיות עם סטטיסטיקה. */
  getAll(): Observable<EducationPlaceStatsDto[]> {
    return this.http.get<EducationPlaceStatsDto[]>('EducationPlaces');
  }

  /** גרסת Promise לרשימת פנימיות. */
  getAllAsync(): Promise<EducationPlaceStatsDto[]> {
    return firstValueFrom(this.getAll());
  }

  /** פנימייה אחת עם סטטיסטיקה. */
  getById(id: number): Observable<EducationPlaceStatsDto> {
    return this.http.get<EducationPlaceStatsDto>(`EducationPlaces/${id}`);
  }

  /** גרסת Promise לפנימייה בודדת. */
  getByIdAsync(id: number): Promise<EducationPlaceStatsDto> {
    return firstValueFrom(this.getById(id));
  }

  /** יצירת פנימייה חדשה. */
  create(dto: CreateEducationPlaceDto): Observable<EducationPlaceDto> {
    return this.http.post<EducationPlaceDto>('EducationPlaces', dto);
  }

  /** יצירה ב-async/await. */
  createAsync(dto: CreateEducationPlaceDto): Promise<EducationPlaceDto> {
    return firstValueFrom(this.create(dto));
  }

  /** עדכון שם ועיר (גוף ללא id — המזהה בנתיב). */
  update(id: number, dto: UpdateEducationPlaceDto): Observable<EducationPlaceStatsDto> {
    const { name, city } = dto;
    return this.http.put<EducationPlaceStatsDto>(`EducationPlaces/${id}`, { name, city });
  }

  /** עדכון ב-async/await. */
  updateAsync(id: number, dto: UpdateEducationPlaceDto): Promise<EducationPlaceStatsDto> {
    return firstValueFrom(this.update(id, dto));
  }

  /** מחיקת פנימייה. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`EducationPlaces/${id}`);
  }

  /** מחיקה ב-async/await. */
  deleteAsync(id: number): Promise<void> {
    return firstValueFrom(this.delete(id));
  }

  /** עדכון דגל פעילות (PATCH). */
  setActiveAsync(id: number, isActive: boolean): Promise<EducationPlaceDto> {
    return firstValueFrom(
      this.http.patch<EducationPlaceDto>(`EducationPlaces/${id}/active`, { isActive }),
    );
  }
}
