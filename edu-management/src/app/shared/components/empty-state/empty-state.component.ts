/** מסך «אין נתונים» עם אייקון, כותרת וכפתור פעולה אופציונלי. */
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state__icon">{{ icon() }}</mat-icon>
      <h3 class="empty-state__title">{{ title() }}</h3>
      <p class="empty-state__description">{{ description() }}</p>
      @if (actionLabel()) {
        <button mat-raised-button color="primary" type="button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        background: white;
        border-radius: 8px;
        border: 2px dashed rgba(0, 61, 122, 0.22);
      }

      .empty-state__icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: rgba(0, 61, 122, 0.35);
        margin-bottom: 16px;
      }

      .empty-state__title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gov-text);
        margin: 0 0 8px;
      }

      .empty-state__description {
        color: var(--gov-muted);
        margin: 0 0 24px;
        max-width: 400px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nothing here');
  readonly description = input('');
  readonly actionLabel = input('');

  readonly action = output<void>();
}
