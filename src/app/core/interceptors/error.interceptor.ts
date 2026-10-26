import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

        if (error.status == 401 || error.status == 403) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (error.status == 404) {
          errorMessage = 'The requested resource was not found.';
        }
      }

      console.error('[Http Error Interceptor] ' + errorMessage);
      alert(errorMessage);

      return throwError(() => error);
    }),
  );
};
