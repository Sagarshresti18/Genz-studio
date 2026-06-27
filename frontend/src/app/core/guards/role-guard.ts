import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { UserRole } from '../models/role';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = (route.data['roles'] as UserRole[] | undefined) ?? [];
  const user = authService.user();

  if (!user) {
    return router.createUrlTree(['/auth']);
  }

  return expectedRoles.length === 0 || expectedRoles.includes(user.role)
    ? true
    : router.createUrlTree(['/dashboard']);
};
