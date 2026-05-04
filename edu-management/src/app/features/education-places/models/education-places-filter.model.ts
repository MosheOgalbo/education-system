/**
 * מצב סינון מתקדם לדף פנימיות — נפרד משדה החיפוש החופשי.
 */
import { EducationPlaceStatus } from '../../../core/models/education-place.model';

/** מפתח לטאב/מחיקת מימד סינון בודד. */
export type EducationPlacesFilterDimension =
  | 'city'
  | 'status'
  | 'totalStudents'
  | 'activeStudents'
  | 'averageAge';

/** ערכים מהחלונית «סינון» (ללא חיפוש טקסט). */
export interface EducationPlacesStructuredFilters {
  city: string | null;
  status: EducationPlaceStatus | null;
  /** סה״כ משויכים — התאמה מדויקת; null = ללא סינון לפי שדה זה. */
  totalStudents: number | null;
  /** תלמידים פעילים — התאמה מדויקת ל־activeStudentCount. */
  activeStudents: number | null;
  /** ממוצע גיל — התאמה מספרית (עם סובלנות עשרונית קלה); null = ללא סינון. */
  averageAge: number | null;
}

export interface EducationPlacesFilterTabDescriptor {
  id: EducationPlacesFilterDimension;
  label: string;
}
