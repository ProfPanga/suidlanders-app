import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Camp provisioning/sync requests authenticate with the short-lived sync token;
  // every other request uses the logged-in user's JWT. (Previously the sync token
  // was preferred globally, which sent the wrong token on staff/member API calls.)
  const isCampSync = req.url.includes('/auth/camp/') || req.url.includes('/sync');
  const token = isCampSync ? auth.getSyncToken() : auth.getToken();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
