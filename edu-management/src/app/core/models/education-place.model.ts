export interface EducationPlaceStatsDto {
  id: number;
  name: string;
  city: string;
  activeStudentCount: number;
  averageAge: number;
}

export interface CreateEducationPlaceDto {
  name: string;
  city: string;
}

export interface UpdateEducationPlaceDto extends CreateEducationPlaceDto {
  id: number;
}
