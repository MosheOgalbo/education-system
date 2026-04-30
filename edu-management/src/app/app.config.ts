import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { API_BASE_URL } from './core/config/api.config';
import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(MatDialogModule, MatSnackBarModule),
    { provide: API_BASE_URL, useValue: '' },
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, errorHandlerInterceptor])),
    provideAnimationsAsync(),
    provideRouter(routes),
  ],
};
