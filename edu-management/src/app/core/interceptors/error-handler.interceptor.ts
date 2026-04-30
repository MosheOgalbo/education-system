import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { isApiErrorBody } from '../models/api-error.model';
import { ToastService } from '../services/toast.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const body = err.error;
        const msg = isApiErrorBody(body)
          ? body.message
          : typeof body === 'string' && body.length
            ? body
            : err.message;
        toast.error(msg);
      }
      return throwError(() => err);
    })
  );
};
