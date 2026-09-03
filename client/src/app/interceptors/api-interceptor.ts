import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoadingService } from '../services/loading.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;

  if (req.url.startsWith(apiUrl)) {
    const loading = inject(LoadingService);
    loading.start();

    const request = req.clone({
      withCredentials: true,
    });

    return next(request).pipe(finalize(() => loading.stop()));
  }

  return next(req);
};
