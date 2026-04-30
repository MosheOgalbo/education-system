import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="error-box">
      <mat-icon color="warn">error_outline</mat-icon>
      <p>{{ message() }}</p>
      @if (retryLabel()) {
        <button mat-stroked-button color="primary" type="button" (click)="retry.emit()">
          {{ retryLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    .error-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }
    mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    p {
      margin: 0;
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-error);
    }
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly retryLabel = input<string>('נסה שוב');
  readonly retry = output<void>();
}
