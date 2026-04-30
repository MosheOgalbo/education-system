export interface GenericColumn<T> {
  key: keyof T & string;
  label: string;
  /** Optional formatter; default: `row[key]` */
  format?: (row: T) => string;
}
