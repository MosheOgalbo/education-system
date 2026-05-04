/**
 * סינון רשימת תלמידים בפנימייה — סטטוס, שם (חיפוש טקסט), גיל מדויק.
 */

/** מפתח טאב תצוגה / הסרת מסנן בודד. */
export type StudentsFilterTabId = 'status' | 'name' | 'age';

export interface StudentsFilterTabDescriptor {
  id: StudentsFilterTabId;
  label: string;
}

export interface StudentsListFilters {
  /** null = כל הסטטוסים */
  status: boolean | null;
  /** תת־מחרוזת בשם התלמיד */
  nameQuery: string;
  /** גיל מדויק; null = ללא סינון גיל */
  age: number | null;
}
