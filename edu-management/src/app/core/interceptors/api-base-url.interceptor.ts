import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_CONFIG } from '../config/api.config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const { baseUrl } = inject(API_CONFIG);

  // Only prefix relative URLs (skip CDN / external calls)
  if (req.url.startsWith('http')) {
    return next(req);
  }

  const apiReq = req.clone({
    url: `${baseUrl}/${req.url}`,
  });

  return next(apiReq);
};
