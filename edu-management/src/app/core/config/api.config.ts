import { InjectionToken } from '@angular/core';

/** Optional HTTP API origin (e.g. `https://api.example.com`). Empty = same-origin + dev proxy. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => '',
});

export const API_SEGMENT = '/api';
