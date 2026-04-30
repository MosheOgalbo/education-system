export interface Student {
  id: number;
  name: string;
  identityNumber: string;
  age: number;
  educationPlaceId: number;
  isActive: boolean;
}

export interface CreateStudentPayload {
  name: string;
  identityNumber: string;
  age: number;
  educationPlaceId: number;
  isActive: boolean;
}

export interface UpdateStudentPayload extends CreateStudentPayload {}
