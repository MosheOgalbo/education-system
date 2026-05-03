/**
 * טיפוסים לטבלה הגנרית: עמודות, פעולות שורה, מצב מיון — הפרדה בין הגדרת תצוגה לבין הרכיב.
 */

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (row: T) => string | number;
  cellClass?: (row: T) => string;
  headerTooltip?: string;
}

export interface TableAction<T> {
  icon: string;
  /** טקסט/אייקון דינמיים לפי שורה — למשל «הפוך ללא פעיל» מול «הפוך לפעיל» */
  iconFn?: (row: T) => string;
  label: string;
  labelFn?: (row: T) => string;
  color?: 'primary' | 'accent' | 'warn';
  handler: (row: T) => void;
  disabled?: (row: T) => boolean;
  tooltip?: string;
  tooltipFn?: (row: T) => string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  direction: SortDirection;
}
