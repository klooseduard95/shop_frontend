import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { Role } from '../../shared/types/users.types';
import { selectAuthGuardData } from '../state/auth.selectors';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const expectedRole = route.data['role'] as Role;

  return store.select(selectAuthGuardData).pipe(
    filter(({ initialized }) => initialized),
    take(1),
    map(({ user }) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      return user.role === expectedRole ? true : router.createUrlTree(['/products']);
    }),
  );
};
