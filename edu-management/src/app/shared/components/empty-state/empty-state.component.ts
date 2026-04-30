import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty">
      <mat-icon>{{ icon() }}</mat-icon>
      <p>{{ message() }}</p>
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
    }
    mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.6;
    }
    p {
      margin: 0;
      font: var(--mat-sys-body-large);
    }
  `,
})
export class EmptyStateComponent {
  readonly message = input.required<string>();
  readonly icon = input<string>('inbox');
}
