/** ממשקי DTO לפנימיות ולסטטיסטיקה — תואמים ל-API. */
export interface EducationPlaceStatsDto {
  id: number;
  name: string;
  city: string;
  isActive: boolean;
  activeStudentCount: number;
  averageAge: number;
}

/** תשובת POST/PUT/PATCH — ללא שדות סטטיסטיקה מחושבים. */
export interface EducationPlaceDto {
  id: number;
  name: string;
  city: string;
  isActive: boolean;
}

export interface CreateEducationPlaceDto {
  name: string;
  city: string;
}

export interface UpdateEducationPlaceDto extends CreateEducationPlaceDto {
  id: number;
}
