import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  StudentDto,
  CreateStudentDto,
  UpdateStudentDto,
  UpsertStudentDto,
} from '../../../core/models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);

  getByEducationPlace(educationPlaceId: number): Observable<StudentDto[]> {
    const params = new HttpParams().set('educationPlaceId', educationPlaceId);
    return this.http.get<StudentDto[]>('Students', { params });
  }

  getById(id: number): Observable<StudentDto> {
    return this.http.get<StudentDto>(`Students/${id}`);
  }

  create(dto: CreateStudentDto): Observable<StudentDto> {
    return this.http.post<StudentDto>('Students', dto);
  }

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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`Students/${id}`);
  }

  upsert(dto: UpsertStudentDto): Observable<StudentDto> {
    return this.http.post<StudentDto>('Students/upsert', dto);
  }
}
