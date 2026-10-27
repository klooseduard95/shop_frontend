import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAuthState } from '../../features/shared/state/app.reducers';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthState).pipe(
    filter(({ initialized }) => initialized),
    take(1),
    map(({ user }) => (user ? true : router.createUrlTree(['/login']))),
  );
};
