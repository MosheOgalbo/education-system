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
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  handler: (row: T) => void;
  disabled?: (row: T) => boolean;
  tooltip?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  direction: SortDirection;
}
