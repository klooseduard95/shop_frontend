import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { catchError, exhaustMap, filter, fromEvent, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
  sessionClearedInAnotherTab,
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

  syncSessionBetweenTabs$ = createEffect(() =>
    fromEvent<StorageEvent>(window, 'storage').pipe(
      filter(
        (event) => event.storageArea === localStorage && event.key === AuthService.tokenStorageKey,
      ),
      map((event) => {
        if (event.newValue) {
          return restoreSession({
            token: event.newValue,
          });
        }

        return sessionClearedInAnotherTab({
          returnUrl: this.getCurrentProtectedUrl(),
        });
      }),
    ),
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(restoreSession),
      exhaustMap(({ token }) =>
        this.authService.getProfile(token).pipe(
          map((user) => restoreSessionSuccess({ user })),
          catchError((error: Error) => {
            this.authService.clearStoredToken();

            return of(
              restoreSessionFailure({
                error: error.message,
              }),
            );
          }),
        ),
      ),
    ),
  );

  navigateAfterSessionRestore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(restoreSessionSuccess),
        filter(() => this.isLoginPage()),
        tap(() => {
          void this.router.navigateByUrl(this.getPostLoginDestination());
        }),
      ),
    { dispatch: false },
  );

  navigateAfterCrossTabLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(sessionClearedInAnotherTab),
        tap(({ returnUrl }) => {
          void this.router.navigate(['/login'], {
            queryParams: { returnUrl },
          });
        }),
      ),
    { dispatch: false },
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          switchMap(({ token }) =>
            this.authService.getProfile(token).pipe(map((user) => loginSuccess({ user, token }))),
          ),
          catchError(() =>
            of(
              loginFailure({
                error: 'Invalid credentials. Please try again.',
              }),
            ),
          ),
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

          void this.router.navigateByUrl(this.getPostLoginDestination());
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

  private getPostLoginDestination(): string {
    const returnUrl = this.router.parseUrl(this.router.url).queryParamMap.get('returnUrl');

    if (
      returnUrl?.startsWith('/') &&
      !returnUrl.startsWith('//') &&
      !returnUrl.startsWith('/login')
    ) {
      return returnUrl;
    }

    return '/products';
  }

  private getCurrentProtectedUrl(): string {
    const currentUrl = this.router.url;

    if (
      currentUrl.startsWith('/') &&
      !currentUrl.startsWith('//') &&
      currentUrl !== '/login' &&
      !currentUrl.startsWith('/login?')
    ) {
      return currentUrl;
    }

    return '/products';
  }

  private isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/login?');
  }
}
