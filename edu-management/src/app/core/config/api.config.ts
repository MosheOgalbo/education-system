import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

/** Same-origin `/api` — dev server uses `proxy.conf.json`; Docker nginx proxies `/api` too. */
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => ({
    baseUrl: '/api',
    timeout: 30_000,
  }),
});
