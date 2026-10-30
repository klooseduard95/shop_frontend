import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs';
import { selectAuthToken } from '../state/auth/auth.reducer';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectAuthToken).pipe(
    take(1),
    switchMap((token) => {
      const authReq =
        token && !req.headers.has('Authorization')
          ? req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            })
          : req;

      return next(authReq);
    }),
  );
};
