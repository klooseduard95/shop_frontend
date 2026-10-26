import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Role } from '../../features/shared/types/users.types';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'] as Role;

  return authService.ensureProfile().pipe(
    map((user) => (user?.role === expectedRole ? true : router.createUrlTree(['/products']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
