import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** Prevent authenticated users from seeing the login page again. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    map(isLoggedIn =>
      isLoggedIn
        ? router.createUrlTree(['/tabs/dashboard'])
        : true
    )
  );
};
