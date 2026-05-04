/**
 * הגדרת אפליקציה גלובלית: עברית, Router, HTTP עם interceptors, Material (דיאלוג + Snackbar), אנימציות.
 *
 * החלטות מרכזיות (למה כך ולא אחרת):
 * - LOCALE_ID עברית — תאריכים/מספרים עקביים עם חוויית משתמש ישראלית.
 * - provideZoneChangeDetection + eventCoalescing — פחות עבודה כפולה על אירועי UI צפופים (טבלאות/סינון).
 * - PreloadAllModules — אחרי המסך הראשון, טעינת chunks ברקע לניווט מהיר בלי להמתין בכל קליק (מתאים לפרויקט בגודל זה).
 * - withViewTransitions — מעברי דף חלקים יותר דרך View Transitions API כשהדפדפן תומך.
 * - interceptors כפונקציות — API מודרני של Angular, קל לבדיקה והרכבה ללא מחלקות מיותרות.
 * - provideAnimationsAsync — טעינת מנוע האנימציה בעצלינות ומשפר first load לעומת provideAnimations הסינכרוני.
 */
import { registerLocaleData } from '@angular/common';
import localeHe from '@angular/common/locales/he';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

registerLocaleData(localeHe);

import { routes } from './app.routes';
import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // כיוון RTL ופורמט מקומי לכל השירותים והצינור של Angular Material.
    { provide: LOCALE_ID, useValue: 'he' },
    // צמצום מחזורי זיהוי שינוי על זרם אירועים (למשל הקלדה מהירה בשדות חיפוש).
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(MatDialogModule, MatSnackBarModule),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions(),
    ),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, errorHandlerInterceptor])),
    provideAnimationsAsync(),
  ],
};
