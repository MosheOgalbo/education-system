import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle],
  template: `
    <div class="skeleton-table mat-elevation-z2">
      <!-- Header row -->
      <div class="skeleton-row skeleton-header">
        @for (_ of headerCells; track $index) {
          <div class="skeleton-cell skeleton-cell--header"></div>
        }
      </div>

      <!-- Data rows -->
      @for (_ of rowArray(); track $index) {
        <div class="skeleton-row">
          @for (w of cellWidths; track $index) {
            <div class="skeleton-cell skeleton-pulse" [ngStyle]="{ width: w }"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .skeleton-table {
        background: white;
        border-radius: 8px;
        overflow: hidden;
      }

      .skeleton-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;
      }

      .skeleton-header {
        background: #fafafa;
      }

      .skeleton-cell {
        height: 16px;
        border-radius: 4px;
        background: #e0e0e0;
        flex: 1;
      }

      .skeleton-cell--header {
        background: #c8c8c8;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      .skeleton-pulse {
        animation: pulse 1.4s ease-in-out infinite;
      }

      .skeleton-row:nth-child(2n) .skeleton-pulse {
        animation-delay: 0.2s;
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  readonly rows = input(5);

  protected readonly headerCells = [1, 2, 3, 4, 5];
  protected readonly cellWidths = ['30%', '20%', '15%', '15%', '20%'];

  protected readonly rowArray = () => Array.from({ length: this.rows() });
}
