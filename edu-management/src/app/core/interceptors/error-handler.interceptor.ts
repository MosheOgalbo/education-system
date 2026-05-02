/**
 * Interceptor מרכזי לשגיאות HTTP.
 *
 * למה לא טוסט על כל שגיאה: בקשות GET שמציגות מסך שגיאה מלא (error-state) יוצרות כפילות מעצבנת
 * אם גם נזרק טוסט. לעומת זאת ב-POST/PUT/PATCH/DELETE המשתמש צריך פידבק מיידי כי אין תמיד מסך ייעודי.
 *
 * למה מחזירים throwError אחרי מיפוי: שירותי ה-store עדיין יכולים לתפוס Promise ולעדכן state ל-error,
 * בזמן שההודעה המנוסחת מגיעה מ-toApiError אחיד.
 */
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';
import { toApiError } from '../utils/http-error.mapper';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = toApiError(error);

      const skipToastForAuth = error.status === 401 || error.status === 403;
      /** טעינות (GET) מציגות מסך שגיאה מלא — טוסט כפול מיותר. פעולות שינוי עדיין מקבלות טוסט. */
      const isReadOnlyRequest = req.method === 'GET' || req.method === 'HEAD';

      if (!skipToastForAuth && !isReadOnlyRequest) {
        toast.error(apiError.message);
      }

      return throwError(() => apiError);
    }),
  );
};
