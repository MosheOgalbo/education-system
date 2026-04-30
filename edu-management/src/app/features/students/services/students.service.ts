import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_SEGMENT } from '../../../core/config/api.config';
import type {
  CreateStudentPayload,
  Student,
  UpdateStudentPayload,
} from '../../../core/models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_SEGMENT}/Students`;

  getAll(educationPlaceId?: number | null): Observable<Student[]> {
    const q =
      educationPlaceId != null ? `?educationPlaceId=${educationPlaceId}` : '';
    return this.http.get<Student[]>(`${this.base}${q}`);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.base}/${id}`);
  }

  create(body: CreateStudentPayload): Observable<Student> {
    return this.http.post<Student>(this.base, body);
  }

  update(id: number, body: UpdateStudentPayload): Observable<Student> {
    return this.http.put<Student>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
