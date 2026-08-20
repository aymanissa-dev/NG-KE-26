import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.authReady;

  if (!authService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/workspace']);
};
