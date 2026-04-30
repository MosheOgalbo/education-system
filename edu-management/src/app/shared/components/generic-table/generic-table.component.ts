import { Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { GenericColumn } from './generic-table.types';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <table mat-table class="mat-elevation-z1" [dataSource]="data()">
      @for (col of columns(); track col.key) {
        <ng-container [matColumnDef]="col.key">
          <th mat-header-cell *matHeaderCellDef>{{ col.label }}</th>
          <td mat-cell *matCellDef="let row">{{ cellValue(row, col) }}</td>
        </ng-container>
      }
      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
    </table>
  `,
})
export class GenericTableComponent<T extends object> {
  readonly columns = input.required<GenericColumn<T>[]>();
  readonly data = input.required<T[]>();

  readonly displayedColumns = computed(() => this.columns().map((c) => c.key));

  cellValue(row: T, col: GenericColumn<T>): string {
    if (col.format) {
      return col.format(row);
    }
    const v = row[col.key];
    if (v === null || v === undefined) {
      return '';
    }
    return String(v);
  }
}
