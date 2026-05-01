import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly BASE_CONFIG: MatSnackBarConfig = {
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.BASE_CONFIG,
      duration: 3000,
      panelClass: ['toast--success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'סגור', {
      ...this.BASE_CONFIG,
      duration: 8000,
      panelClass: ['toast--error'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.BASE_CONFIG,
      duration: 4000,
      panelClass: ['toast--info'],
    });
  }
}
