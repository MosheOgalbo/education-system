/**
 * טבלת Material גנרית: עמודות דינמיות, מיון לקוח, פעולות בשורה (אייקונים או תפריט).
 * `dir="ltr"` על הטבלה בתוך אפליקציית RTL — תיקון יישור MatTable; בתוך התאים נשאר RTL לעברית.
 * OnPush לביצועים; מיון עם `localeCompare('he', { numeric: true })`.
 */
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
import { MatMenuModule } from '@angular/material/menu';
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
    MatMenuModule,
  ],
  template: `
    <div class="table-outer mat-elevation-z2">
      @if (showFilterButton()) {
        <div class="table-toolbar">
          <button
            mat-icon-button
            type="button"
            class="table-toolbar__filter"
            matTooltip="סינון"
            aria-label="פתיחת סינון"
            (click)="filterClick.emit()"
          >
            <mat-icon>filter_list</mat-icon>
          </button>
        </div>
      }
      <div class="table-wrapper scroll-x">
      <!-- min-width + overflow-x: במסכים צרים הטבלה נגללת אופקית במקום למעוך עמודות -->
      <table
        mat-table
        dir="ltr"
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
            <th mat-header-cell *matHeaderCellDef class="align-center actions-header">פעולות</th>
            <td mat-cell *matCellDef="let row" class="align-center actions-cell">
              @if (useActionsMenu()) {
                <button
                  mat-icon-button
                  type="button"
                  color="primary"
                  class="actions-menu-trigger"
                  [matMenuTriggerFor]="rowMenu"
                  matTooltip="פעולות"
                  aria-label="פתיחת תפריט פעולות"
                  (click)="$event.stopPropagation()"
                >
                  <!-- more_vert: שלוש נקודות בטור (אנכי) — קונבנציית «עוד פעולות» -->
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #rowMenu="matMenu" class="actions-mat-menu">
                  @for (action of actions(); track $index) {
                    <button
                      mat-menu-item
                      type="button"
                      [disabled]="action.disabled ? action.disabled(row) : false"
                      [matTooltip]="
                        action.tooltipFn
                          ? action.tooltipFn(row)
                          : (action.tooltip ?? '')
                      "
                      matTooltipPosition="before"
                      [class.actions-mat-menu__item--warn]="action.color === 'warn'"
                      (click)="invokeAction(action, row)"
                    >
                      <mat-icon>{{ action.iconFn ? action.iconFn(row) : action.icon }}</mat-icon>
                      <span>{{ action.labelFn ? action.labelFn(row) : action.label }}</span>
                    </button>
                  }
                </mat-menu>
              } @else {
                @for (action of actions(); track action.label) {
                  <button
                    mat-icon-button
                    [color]="action.color ?? 'primary'"
                    [matTooltip]="
                      action.tooltipFn
                        ? action.tooltipFn(row)
                        : (action.tooltip ?? action.label)
                    "
                    [disabled]="action.disabled ? action.disabled(row) : false"
                    (click)="invokeAction(action, row); $event.stopPropagation()"
                  >
                    <mat-icon>{{ action.iconFn ? action.iconFn(row) : action.icon }}</mat-icon>
                  </button>
                }
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns()"
          class="data-row"
          [class.data-row--clickable]="rowClickable()"
          [ngClass]="rowClassFn() ? rowClassFn()!(row) : ''"
          (click)="onRowClick(row)"
        ></tr>
      </table>

      <div class="table-footer">
        <span class="row-count">{{ data().length }} רשומות</span>
      </div>
      </div>
    </div>
  `,
  styles: [
    `
      .table-outer {
        border-radius: 10px;
        overflow: hidden;
        background: var(--gov-card);
        border: 1px solid rgba(0, 61, 122, 0.12);
        box-shadow: 0 1px 4px rgba(0, 61, 122, 0.07);
        max-width: 100%;
      }

      .table-toolbar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 4px 8px 4px 12px;
        border-bottom: 1px solid rgba(0, 61, 122, 0.12);
        background: #f5f9fd;
      }

      .table-toolbar__filter {
        color: var(--gov-header);
      }

      .table-wrapper {
        overflow: hidden;
        background: var(--gov-card);
        max-width: 100%;
      }

      .table-wrapper.scroll-x {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .generic-table {
        width: 100%;
        min-width: 640px;
        direction: ltr;
      }

      .generic-table .mat-mdc-header-cell,
      .generic-table .mat-mdc-cell {
        direction: rtl;
      }

      .generic-table .align-left {
        text-align: right;
      }

      .generic-table .align-center {
        text-align: center;
      }

      /* כותרות עם מיון: מיון Material עטוף בקומפוננטה — ng-deep לחדירה */
      :host ::ng-deep .generic-table .mat-mdc-header-cell.align-center .mat-sort-header-container {
        justify-content: center;
      }

      :host ::ng-deep .generic-table .mat-mdc-header-cell.align-center .mat-sort-header-content {
        text-align: center;
      }

      .generic-table .mat-mdc-header-cell.align-center {
        text-align: center;
      }

      .generic-table .mat-mdc-cell.align-center {
        text-align: center;
      }

      /* קו תחתון לכותרות + הפרדה ברורה בין שורות נתונים */
      .generic-table .mat-mdc-header-row .mat-mdc-header-cell {
        border-bottom: 2px solid rgba(0, 61, 122, 0.32);
      }

      .generic-table .mat-mdc-row.data-row .mat-mdc-cell {
        border-bottom: 1px solid rgba(0, 61, 122, 0.22);
      }

      .generic-table .mat-mdc-row.data-row:last-child .mat-mdc-cell {
        border-bottom: 1px solid rgba(0, 61, 122, 0.28);
      }

      .mat-mdc-row.data-row--clickable {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .mat-mdc-row.data-row--inactive {
        opacity: 0.72;
      }

      .mat-mdc-header-row {
        background: var(--gov-table-header-bg) !important;
      }

      .mat-mdc-row.data-row--clickable:hover {
        background-color: var(--gov-table-row-hover);
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

      .actions-header {
        white-space: nowrap;
      }

      .actions-cell {
        white-space: nowrap;
      }

      .actions-menu-trigger {
        /* אזור לחיצה נוח במובייל */
        width: 44px;
        height: 44px;
        padding: 0;
      }

      .actions-menu-trigger mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      ::ng-deep .actions-mat-menu .mat-mdc-menu-item .mat-icon {
        margin-left: 12px;
        color: var(--gov-header);
      }

      ::ng-deep .actions-mat-menu .actions-mat-menu__item--warn .mat-icon {
        color: #c62828;
      }

      .table-footer {
        padding: 10px 18px;
        background: #f5f9fd;
        border-top: 1px solid rgba(0, 61, 122, 0.12);
      }
      .table-footer .row-count {
        font-size: 0.85rem;
        color: var(--gov-muted);
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .table-outer {
          border-radius: 8px;
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
  /** כפתור סינון מעל הטבלה — הדף פותח חלונית ומחיל מסנן בלחיצה «סינון». */
  readonly showFilterButton = input(false);
  readonly filterClick = output<void>();

  /** תפריט «פעולות» במקום כפתורי אייקון לכל פעולה */
  readonly useActionsMenu = input(false);
  /** לחיצה על שורה (כבוי כשמשתמשים בתפריט פעולות בלבד) */
  readonly rowClickable = input(true);
  readonly rowClassFn = input<(row: T) => string | null | undefined>();

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
      const cmp = String(aVal).localeCompare(String(bVal), 'he', {
        numeric: true,
      });
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  /** לחיצה על שורה — רק אם rowClickable מופעל. */
  protected onRowClick(row: T): void {
    if (this.rowClickable()) {
      this.rowClick.emit(row);
    }
  }

  /** הפעלת פעולת שורה מתפריט או כפתור אייקון. */
  protected invokeAction(action: TableAction<T>, row: T): void {
    action.handler(row);
  }

  /** עדכון מצב מיון מ-MatSort. */
  protected onSort(sort: Sort): void {
    const state: SortState = {
      column: sort.active,
      direction: (sort.direction as SortState['direction']) || null,
    };
    this.sortState.set(state);
    this.sortChange.emit(state);
  }

  /** גישה לערך לפי מפתח, כולל נקודות (למשל a.b). */
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
