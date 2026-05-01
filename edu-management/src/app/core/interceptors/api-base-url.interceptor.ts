import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_CONFIG } from '../config/api.config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const { baseUrl } = inject(API_CONFIG);

  // Only prefix relative URLs (skip CDN / external calls)
  if (req.url.startsWith('http')) {
    return next(req);
  }

  const base = baseUrl.replace(/\/$/, '');
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  const joined = `${base}${path}`.replace(/([^:])\/{2,}/g, '$1/');
  const apiReq = req.clone({ url: joined });

  return next(apiReq);
};
