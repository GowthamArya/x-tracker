import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'https://localhost:7043/api';

  if (req.url.startsWith(apiUrl)) {
    const request = req.clone({
      withCredentials: true,
    });

    return next(request);
  }

  return next(req);
};