import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import type { ApiError } from '../models/api-error.model';
import { ToastService } from '../services/toast.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError = isApiError(error.error)
        ? error.error
        : {
            statusCode: error.status,
            message: getDefaultMessage(error.status),
            timestamp: new Date().toISOString(),
          };

      // Don't toast 401/403 — handle in auth guard
      if (error.status !== 401 && error.status !== 403) {
        toast.error(apiError.message);
      }

      return throwError(() => apiError);
    })
  );
};

function isApiError(body: unknown): body is ApiError {
  return (
    typeof body === 'object' &&
    body !== null &&
    'statusCode' in body &&
    'message' in body
  );
}

function getDefaultMessage(status: number): string {
  const messages: Record<number, string> = {
    0: 'Server unreachable. Check your network connection.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may already exist.',
    422: 'Invalid data submitted.',
    500: 'An internal server error occurred.',
  };
  return messages[status] ?? `Unexpected error (${status})`;
}
