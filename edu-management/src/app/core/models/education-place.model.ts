export interface EducationPlaceStatsDto {
  id: number;
  name: string;
  city: string;
  activeStudentCount: number;
  averageAge: number;
}

/** תשובת POST — ללא שדות סטטיסטיקה */
export interface EducationPlaceDto {
  id: number;
  name: string;
  city: string;
}

export interface CreateEducationPlaceDto {
  name: string;
  city: string;
}

export interface UpdateEducationPlaceDto extends CreateEducationPlaceDto {
  id: number;
}
