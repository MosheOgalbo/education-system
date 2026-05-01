import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="error-state">
      <mat-icon class="error-state__icon">error_outline</mat-icon>
      <h3 class="error-state__title">Something went wrong</h3>
      <p class="error-state__message">{{ message() }}</p>
      <button mat-raised-button color="warn" type="button" (click)="retry.emit()">
        <mat-icon>refresh</mat-icon> Retry
      </button>
    </div>
  `,
  styles: [
    `
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64px 24px;
        text-align: center;
        background: white;
        border-radius: 8px;
        border: 2px solid #ffcdd2;
      }

      .error-state__icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: #ef5350;
        margin-bottom: 16px;
      }

      .error-state__title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #c62828;
        margin: 0 0 8px;
      }

      .error-state__message {
        color: #666;
        margin: 0 0 24px;
        max-width: 400px;
      }
    `,
  ],
})
export class ErrorStateComponent {
  readonly message = input('An unexpected error occurred.');
  readonly retry = output<void>();
}
