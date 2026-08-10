import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;

  if (req.url.startsWith(apiUrl)) {
    const request = req.clone({
      withCredentials: true,
    });

    return next(request);
  }

  return next(req);
};