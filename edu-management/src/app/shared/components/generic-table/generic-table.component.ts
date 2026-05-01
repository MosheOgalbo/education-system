import {
  Component,
  computed,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ColumnDef, TableAction, SortState } from './generic-table.types';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <div class="table-wrapper mat-elevation-z2">
      <table
        mat-table
        [dataSource]="sortedData()"
        matSort
        (matSortChange)="onSort($event)"
        class="generic-table"
      >
        @for (col of columns(); track col.key) {
          <ng-container [matColumnDef]="col.key.toString()">
            <th
              mat-header-cell
              *matHeaderCellDef
              [mat-sort-header]="col.key.toString()"
              [disabled]="!col.sortable"
              [style.width]="col.width ?? 'auto'"
              [class]="'align-' + (col.align ?? 'left')"
              [matTooltip]="col.headerTooltip ?? ''"
            >
              {{ col.label }}
            </th>

            <td
              mat-cell
              *matCellDef="let row"
              [class]="'align-' + (col.align ?? 'left')"
              [ngClass]="col.cellClass ? col.cellClass(row) : ''"
            >
              {{ col.render ? col.render(row) : getNestedValue(row, col.key.toString()) }}
            </td>
          </ng-container>
        }

        @if (actions().length > 0) {
          <ng-container matColumnDef="__actions">
            <th mat-header-cell *matHeaderCellDef class="align-right">Actions</th>
            <td mat-cell *matCellDef="let row" class="align-right actions-cell">
              @for (action of actions(); track action.label) {
                <button
                  mat-icon-button
                  [color]="action.color ?? 'primary'"
                  [matTooltip]="action.tooltip ?? action.label"
                  [disabled]="action.disabled ? action.disabled(row) : false"
                  (click)="action.handler(row); $event.stopPropagation()"
                >
                  <mat-icon>{{ action.icon }}</mat-icon>
                </button>
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns()"
          class="data-row"
          (click)="rowClick.emit(row)"
        ></tr>
      </table>

      <div class="table-footer">
        <span class="row-count">{{ data().length }} records</span>
      </div>
    </div>
  `,
  styles: [
    `
      .table-wrapper {
        border-radius: 8px;
        overflow: hidden;
        background: white;
      }

      .generic-table {
        width: 100%;
      }

      .mat-mdc-row.data-row {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .mat-mdc-row.data-row:hover {
        background-color: #f0f4ff;
      }

      .align-left {
        text-align: left;
      }
      .align-center {
        text-align: center;
      }
      .align-right {
        text-align: right;
      }

      .actions-cell {
        white-space: nowrap;
      }

      .table-footer {
        padding: 8px 16px;
        background: #fafafa;
        border-top: 1px solid #eee;
      }
      .table-footer .row-count {
        font-size: 0.8rem;
        color: #888;
      }

      @media (max-width: 600px) {
        .generic-table {
          display: block;
          overflow-x: auto;
        }
      }
    `,
  ],
})
export class GenericTableComponent<T extends object> {
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly data = input.required<T[]>();
  readonly actions = input<TableAction<T>[]>([]);
  readonly loading = input(false);
  readonly trackByKey = input<string>('id');

  readonly rowClick = output<T>();
  readonly sortChange = output<SortState>();

  private readonly sortState = signal<SortState>({ column: '', direction: null });

  readonly displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.key.toString());
    return this.actions().length > 0 ? [...cols, '__actions'] : cols;
  });

  readonly sortedData = computed(() => {
    const { column, direction } = this.sortState();
    if (!column || !direction) return this.data();

    return [...this.data()].sort((a, b) => {
      const aVal = this.getNestedValue(a, column);
      const bVal = this.getNestedValue(b, column);
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  protected onSort(sort: Sort): void {
    const state: SortState = {
      column: sort.active,
      direction: (sort.direction as SortState['direction']) || null,
    };
    this.sortState.set(state);
    this.sortChange.emit(state);
  }

  protected getNestedValue(obj: unknown, key: string): unknown {
    return key.split('.').reduce(
      (acc, k) =>
        acc != null && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[k]
          : undefined,
      obj,
    );
  }
}
