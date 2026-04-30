import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-wrap">
      @if (label()) {
        <span class="label">{{ label() }}</span>
      }
      <mat-spinner [diameter]="diameter()" />
    </div>
  `,
  styles: `
    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }
    .label {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-medium);
    }
  `,
})
export class LoadingSkeletonComponent {
  readonly label = input<string>('טוען…');
  readonly diameter = input(40);
}
