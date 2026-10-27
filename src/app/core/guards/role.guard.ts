import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { Role } from '../../features/shared/types/users.types';
import { selectAuthState } from '../../features/shared/state/app.reducers';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const expectedRole = route.data['role'] as Role;

  return store.select(selectAuthState).pipe(
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
