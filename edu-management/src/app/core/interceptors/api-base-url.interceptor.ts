import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const base = inject(API_BASE_URL).replace(/\/$/, '');
  if (!base || req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }
  return next(req.clone({ url: `${base}${req.url}` }));
};
