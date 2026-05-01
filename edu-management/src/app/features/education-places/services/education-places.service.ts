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

  getAll(): Observable<EducationPlaceStatsDto[]> {
    return this.http.get<EducationPlaceStatsDto[]>('EducationPlaces');
  }

  /** async/await מול ה-API (תואם דרישת Hands-On לצד הלקוח). */
  getAllAsync(): Promise<EducationPlaceStatsDto[]> {
    return firstValueFrom(this.getAll());
  }

  getById(id: number): Observable<EducationPlaceStatsDto> {
    return this.http.get<EducationPlaceStatsDto>(`EducationPlaces/${id}`);
  }

  create(dto: CreateEducationPlaceDto): Observable<EducationPlaceDto> {
    return this.http.post<EducationPlaceDto>('EducationPlaces', dto);
  }

  createAsync(dto: CreateEducationPlaceDto): Promise<EducationPlaceDto> {
    return firstValueFrom(this.create(dto));
  }

  update(id: number, dto: UpdateEducationPlaceDto): Observable<EducationPlaceStatsDto> {
    const { name, city } = dto;
    return this.http.put<EducationPlaceStatsDto>(`EducationPlaces/${id}`, { name, city });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`EducationPlaces/${id}`);
  }
}
