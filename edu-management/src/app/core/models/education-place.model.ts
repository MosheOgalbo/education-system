export interface EducationPlaceStats {
  id: number;
  name: string;
  city: string;
  activeStudentCount: number;
  averageAge: number;
}

export interface EducationPlace {
  id: number;
  name: string;
  city: string;
}

export interface CreateEducationPlacePayload {
  name: string;
  city: string;
}

export interface UpdateEducationPlacePayload extends CreateEducationPlacePayload {}
