import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional guard: only allows owner or admin roles.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdminOrOwner()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
