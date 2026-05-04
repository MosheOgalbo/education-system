/** סטטוס פנימייה — תואם JsonStringEnumConverter (camelCase) מה-API. */
export type EducationPlaceStatus = 'active' | 'suspended' | 'inactive';

export function educationPlaceStatusLabel(status: EducationPlaceStatus): string {
  switch (status) {
    case 'active':
      return 'פעילה';
    case 'suspended':
      return 'בהשהייה';
    case 'inactive':
      return 'לא פעילה';
    default:
      return String(status);
  }
}

/** מחלקת תא בטבלה לפי סטטוס. */
export function educationPlaceStatusCellClass(status: EducationPlaceStatus): string {
  if (status === 'active') return 'status--active';
  if (status === 'suspended') return 'status--suspended';
  return 'status--inactive';
}

/** מחלקת שורה בטבלה — רק «לא פעילה» מעומעמת; בהשהייה הצהוב רק בעמודת הסטטוס. */
export function educationPlaceDataRowClass(status: EducationPlaceStatus): string {
  if (status === 'inactive') return 'data-row--inactive';
  return '';
}

/** ממשקי DTO לפנימיות ולסטטיסטיקה — תואמים ל-API. */
export interface EducationPlaceStatsDto {
  id: number;
  name: string;
  city: string;
  status: EducationPlaceStatus;
  /** כל הרשומות ב-Student לפנימייה (פעילים ולא פעילים). */
  totalStudentCount: number;
  activeStudentCount: number;
  averageAge: number;
}

/** תשובת POST/PUT/PATCH — ללא שדות סטטיסטיקה מחושבים. */
export interface EducationPlaceDto {
  id: number;
  name: string;
  city: string;
  status: EducationPlaceStatus;
}

export interface CreateEducationPlaceDto {
  name: string;
  city: string;
}

export interface UpdateEducationPlaceDto extends CreateEducationPlaceDto {
  id: number;
}
