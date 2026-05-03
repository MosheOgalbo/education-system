/**
 * טוקן והגדרות לכתובת בסיס של ה-API (`/api` — proxy בפיתוח / nginx בפרודקשן).
 */
import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

/** אותו מקור: `/api` — בפיתוח proxy; ב-Docker nginx מפנה ל-API. */
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => ({
    baseUrl: '/api',
    timeout: 30_000,
  }),
});
