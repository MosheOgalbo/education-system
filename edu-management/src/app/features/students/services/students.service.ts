/**
 * שירות HTTP ל-`/api/Students` — Observable + עטיפות `*Async` עם `firstValueFrom` לשימוש ב-store.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import {
  StudentDto,
  CreateStudentDto,
  UpdateStudentDto,
  UpsertStudentDto,
} from '../../../core/models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);

  /** רשימת תלמידים; אופציונלי: סינון לפי מזהה פנימייה. */
  getByEducationPlace(educationPlaceId: number): Observable<StudentDto[]> {
    const params = new HttpParams().set('educationPlaceId', educationPlaceId);
    return this.http.get<StudentDto[]>('Students', { params });
  }

  /** רשימת תלמידים — גרסת Promise. */
  getByEducationPlaceAsync(educationPlaceId: number): Promise<StudentDto[]> {
    return firstValueFrom(this.getByEducationPlace(educationPlaceId));
  }

  /** תלמיד יחיד לפי מזהה. */
  getById(id: number): Observable<StudentDto> {
    return this.http.get<StudentDto>(`Students/${id}`);
  }

  /** תלמיד בודד — גרסת Promise. */
  getByIdAsync(id: number): Promise<StudentDto> {
    return firstValueFrom(this.getById(id));
  }

  /** יצירת תלמיד. */
  create(dto: CreateStudentDto): Observable<StudentDto> {
    return this.http.post<StudentDto>('Students', dto);
  }

  /** עדכון תלמיד קיים. */
  update(id: number, dto: UpdateStudentDto): Observable<StudentDto> {
    const { name, identityNumber, age, educationPlaceId, isActive } = dto;
    return this.http.put<StudentDto>(`Students/${id}`, {
      name,
      identityNumber,
      age,
      educationPlaceId,
      isActive,
    });
  }

  /** מחיקת תלמיד. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`Students/${id}`);
  }

  /** יצירה או עדכון בקריאה אחת (`POST .../upsert`). */
  upsert(dto: UpsertStudentDto): Observable<StudentDto> {
    return this.http.post<StudentDto>('Students/upsert', dto);
  }

  /** יצירת תלמיד — גרסת Promise. */
  createAsync(dto: CreateStudentDto): Promise<StudentDto> {
    return firstValueFrom(this.create(dto));
  }

  /** עדכון תלמיד — גרסת Promise. */
  updateAsync(id: number, dto: UpdateStudentDto): Promise<StudentDto> {
    return firstValueFrom(this.update(id, dto));
  }

  /** מחיקה — גרסת Promise. */
  deleteAsync(id: number): Promise<void> {
    return firstValueFrom(this.delete(id));
  }

  /** Upsert — גרסת Promise. */
  upsertAsync(dto: UpsertStudentDto): Promise<StudentDto> {
    return firstValueFrom(this.upsert(dto));
  }
}
