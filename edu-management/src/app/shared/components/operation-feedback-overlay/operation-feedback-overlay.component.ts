/**
 * שכבת מודל מרכזית להודעות פעולה (הצלחה / שגיאה), בסגנון המערכת.
 */
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { OperationFeedbackService } from '../../../core/services/operation-feedback.service';

@Component({
  selector: 'app-operation-feedback-overlay',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './operation-feedback-overlay.component.html',
  styleUrl: './operation-feedback-overlay.component.scss',
})
export class OperationFeedbackOverlayComponent {
  private readonly feedback = inject(OperationFeedbackService);

  protected readonly vm = computed(() => this.feedback.state());

  protected close(): void {
    this.feedback.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
