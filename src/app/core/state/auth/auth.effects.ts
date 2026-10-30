import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import {
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
} from './auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => {
        const token = this.authService.getStoredToken();
        return token ? restoreSession({ token }) : authInitialized();
      }),
    ),
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(restoreSession),
      exhaustMap(() =>
        this.authService.getProfile().pipe(
          map((user) => restoreSessionSuccess({ user })),
          catchError((error: Error) => {
            this.authService.clearStoredToken();
            return of(restoreSessionFailure({ error: error.message }));
          }),
        ),
      ),
    ),
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          switchMap(({ token }) =>
            this.authService.getProfile(token).pipe(map((user) => loginSuccess({ user, token }))),
          ),
          catchError(() => of(loginFailure({ error: 'Invalid credentials. Please try again.' }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ token }) => {
          this.authService.storeToken(token);
          void this.router.navigate(['/products']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          this.authService.clearStoredToken();
          void this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
