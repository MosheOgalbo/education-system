/** ממשקי DTO לתלמיד — תואמים ל-JSON של ה-API (camelCase). */
export interface StudentDto {
  id: number;
  name: string;
  identityNumber: string;
  age: number;
  educationPlaceId: number;
  isActive: boolean;
}

export interface CreateStudentDto {
  name: string;
  identityNumber: string;
  age: number;
  educationPlaceId: number;
  isActive: boolean;
}

export type UpdateStudentDto = StudentDto;

export type UpsertStudentDto = Partial<StudentDto> &
  Pick<StudentDto, 'identityNumber' | 'educationPlaceId'>;
