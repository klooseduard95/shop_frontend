import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { logout } from '../../features/auth/state/auth.actions';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        const requestUrl = req.url.split('?')[0].replace(/\/$/, '');
        const isLoginRequest = requestUrl.endsWith('/auth/login');

        if (error.status === 401 && isLoginRequest) {
          errorMessage = 'Invalid username or password.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication is required to access this resource.';
          store.dispatch(logout());
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      console.error(`[Http Error Interceptor] ${errorMessage}`);

      return throwError(() => error);
    }),
  );
};
