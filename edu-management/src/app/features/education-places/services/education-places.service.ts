import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_SEGMENT } from '../../../core/config/api.config';
import type {
  CreateEducationPlacePayload,
  EducationPlace,
  EducationPlaceStats,
  UpdateEducationPlacePayload,
} from '../../../core/models/education-place.model';

@Injectable({ providedIn: 'root' })
export class EducationPlacesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_SEGMENT}/EducationPlaces`;

  getAll(): Observable<EducationPlaceStats[]> {
    return this.http.get<EducationPlaceStats[]>(this.base);
  }

  getById(id: number): Observable<EducationPlaceStats> {
    return this.http.get<EducationPlaceStats>(`${this.base}/${id}`);
  }

  create(body: CreateEducationPlacePayload): Observable<EducationPlace> {
    return this.http.post<EducationPlace>(this.base, body);
  }

  update(id: number, body: UpdateEducationPlacePayload): Observable<EducationPlace> {
    return this.http.put<EducationPlace>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
