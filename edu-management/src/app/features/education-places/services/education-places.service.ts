import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EducationPlaceStatsDto,
  CreateEducationPlaceDto,
  UpdateEducationPlaceDto,
} from '../../../core/models/education-place.model';

@Injectable({ providedIn: 'root' })
export class EducationPlacesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<EducationPlaceStatsDto[]> {
    return this.http.get<EducationPlaceStatsDto[]>('EducationPlaces');
  }

  getById(id: number): Observable<EducationPlaceStatsDto> {
    return this.http.get<EducationPlaceStatsDto>(`EducationPlaces/${id}`);
  }

  create(dto: CreateEducationPlaceDto): Observable<EducationPlaceStatsDto> {
    return this.http.post<EducationPlaceStatsDto>('EducationPlaces', dto);
  }

  update(id: number, dto: UpdateEducationPlaceDto): Observable<EducationPlaceStatsDto> {
    const { name, city } = dto;
    return this.http.put<EducationPlaceStatsDto>(`EducationPlaces/${id}`, { name, city });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`EducationPlaces/${id}`);
  }
}
