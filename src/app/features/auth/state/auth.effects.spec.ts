import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Actions, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';
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
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: AuthEffects;

  let authService: {
    getStoredToken: ReturnType<typeof vi.fn>;
    getProfile: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    storeToken: ReturnType<typeof vi.fn>;
    clearStoredToken: ReturnType<typeof vi.fn>;
  };

  let router: {
    url: string;
    parseUrl: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    authService = {
      getStoredToken: vi.fn(),
      getProfile: vi.fn(),
      login: vi.fn(),
      storeToken: vi.fn(),
      clearStoredToken: vi.fn(),
    };

    router = {
      url: '/login?returnUrl=%2Fproducts%2F123',
      parseUrl: vi.fn().mockReturnValue({
        queryParamMap: {
          get: vi.fn().mockReturnValue('/products/123'),
        },
      }),
      navigate: vi.fn().mockResolvedValue(true),
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    effects = TestBed.inject(AuthEffects);
  });

  it('should initialize without a session when no token is stored', async () => {
    authService.getStoredToken.mockReturnValue(null);

    const result = firstValueFrom(effects.initializeAuth$);

    actions$.next({ type: ROOT_EFFECTS_INIT });

    await expect(result).resolves.toEqual(authInitialized());
  });

  it('should begin restoration when a token is stored', async () => {
    authService.getStoredToken.mockReturnValue('token');

    const result = firstValueFrom(effects.initializeAuth$);

    actions$.next({ type: ROOT_EFFECTS_INIT });

    await expect(result).resolves.toEqual(restoreSession({ token: 'token' }));
  });

  it('should restore the profile for a persisted session', async () => {
    const user = {
      id: '1',
      username: 'user',
      role: 'CUSTOMER' as const,
    };

    authService.getProfile.mockReturnValue(of(user));

    const result = firstValueFrom(effects.restoreSession$);

    actions$.next(restoreSession({ token: 'token' }));

    await expect(result).resolves.toEqual(restoreSessionSuccess({ user }));
  });

  it('should clear an invalid persisted session', async () => {
    authService.getProfile.mockReturnValue(throwError(() => new Error('Unauthorized')));

    const result = firstValueFrom(effects.restoreSession$);

    actions$.next(restoreSession({ token: 'expired' }));

    await expect(result).resolves.toEqual(restoreSessionFailure({ error: 'Unauthorized' }));

    expect(authService.clearStoredToken).toHaveBeenCalled();
  });

  it('should log in and fetch the profile with the returned token', async () => {
    const credentials = {
      username: 'user',
      password: 'password',
    };

    const user = {
      id: '1',
      username: 'user',
      role: 'CUSTOMER' as const,
    };

    authService.login.mockReturnValue(of({ token: 'token' }));
    authService.getProfile.mockReturnValue(of(user));

    const result = firstValueFrom(effects.login$);

    actions$.next(login({ credentials }));

    await expect(result).resolves.toEqual(loginSuccess({ user, token: 'token' }));

    expect(authService.getProfile).toHaveBeenCalledWith('token');
  });

  it('should dispatch a login failure', async () => {
    authService.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

    const result = firstValueFrom(effects.login$);

    actions$.next(
      login({
        credentials: {
          username: 'user',
        },
      }),
    );

    await expect(result).resolves.toEqual(
      loginFailure({
        error: 'Invalid credentials. Please try again.',
      }),
    );
  });

  it('should persist the token and navigate to the return URL after login', async () => {
    const result = firstValueFrom(effects.loginSuccess$);

    actions$.next(
      loginSuccess({
        user: {
          id: '1',
          username: 'user',
          role: 'CUSTOMER',
        },
        token: 'token',
      }),
    );

    await result;

    expect(authService.storeToken).toHaveBeenCalledWith('token');
    expect(router.parseUrl).toHaveBeenCalledWith('/login?returnUrl=%2Fproducts%2F123');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/products/123');
  });

  it('should navigate to products when no return URL is provided', async () => {
    router.url = '/login';
    router.parseUrl.mockReturnValue({
      queryParamMap: {
        get: vi.fn().mockReturnValue(null),
      },
    });

    const result = firstValueFrom(effects.loginSuccess$);

    actions$.next(
      loginSuccess({
        user: {
          id: '1',
          username: 'user',
          role: 'CUSTOMER',
        },
        token: 'token',
      }),
    );

    await result;

    expect(router.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should reject an external return URL', async () => {
    router.parseUrl.mockReturnValue({
      queryParamMap: {
        get: vi.fn().mockReturnValue('//malicious.example'),
      },
    });

    const result = firstValueFrom(effects.loginSuccess$);

    actions$.next(
      loginSuccess({
        user: {
          id: '1',
          username: 'user',
          role: 'CUSTOMER',
        },
        token: 'token',
      }),
    );

    await result;

    expect(router.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should clear persistence and navigate on logout', async () => {
    const result = firstValueFrom(effects.logout$);

    actions$.next(logout());

    await result;

    expect(authService.clearStoredToken).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should restore a session added in another tab', async () => {
    const result = firstValueFrom(effects.syncSessionBetweenTabs$);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AuthService.tokenStorageKey,
        newValue: 'other-tab-token',
        storageArea: localStorage,
      }),
    );

    await expect(result).resolves.toEqual(
      restoreSession({
        token: 'other-tab-token',
      }),
    );
  });

  it('should clear a session removed in another tab', async () => {
    router.url = '/products/123';

    const result = firstValueFrom(effects.syncSessionBetweenTabs$);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AuthService.tokenStorageKey,
        newValue: null,
        storageArea: localStorage,
      }),
    );

    await expect(result).resolves.toEqual(
      sessionClearedInAnotherTab({
        returnUrl: '/products/123',
      }),
    );
  });

  it('should use products as the cross-tab logout return URL on the login page', async () => {
    router.url = '/login?returnUrl=%2Fproducts%2F123';

    const result = firstValueFrom(effects.syncSessionBetweenTabs$);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AuthService.tokenStorageKey,
        newValue: null,
        storageArea: localStorage,
      }),
    );

    await expect(result).resolves.toEqual(
      sessionClearedInAnotherTab({
        returnUrl: '/products',
      }),
    );
  });

  it('should use products for an unsafe current URL', async () => {
    router.url = '//malicious.example';

    const result = firstValueFrom(effects.syncSessionBetweenTabs$);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AuthService.tokenStorageKey,
        newValue: null,
        storageArea: localStorage,
      }),
    );

    await expect(result).resolves.toEqual(
      sessionClearedInAnotherTab({
        returnUrl: '/products',
      }),
    );
  });

  it('should navigate away from login after session restoration', async () => {
    router.url = '/login';
    router.parseUrl.mockReturnValue({
      queryParamMap: {
        get: vi.fn().mockReturnValue('/shopping-cart'),
      },
    });

    const result = firstValueFrom(effects.navigateAfterSessionRestore$);

    actions$.next(
      restoreSessionSuccess({
        user: {
          id: '1',
          username: 'user',
          role: 'CUSTOMER',
        },
      }),
    );

    await result;

    expect(router.navigateByUrl).toHaveBeenCalledWith('/shopping-cart');
  });

  it('should not navigate after restoration outside the login page', () => {
    router.url = '/products';

    const navigateByUrl = vi.fn();
    router.navigateByUrl = navigateByUrl;

    const emitted = vi.fn();
    const subscription = effects.navigateAfterSessionRestore$.subscribe(emitted);

    actions$.next(
      restoreSessionSuccess({
        user: {
          id: '1',
          username: 'user',
          role: 'CUSTOMER',
        },
      }),
    );

    expect(emitted).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should navigate to login after another tab clears the session', async () => {
    const result = firstValueFrom(effects.navigateAfterCrossTabLogout$);

    actions$.next(
      sessionClearedInAnotherTab({
        returnUrl: '/shopping-cart',
      }),
    );

    await result;

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/shopping-cart',
      },
    });
  });

  it.each(['products', '/login', '/login?returnUrl=%2Fproducts'])(
    'should reject the unsafe return URL "%s"',
    async (returnUrl) => {
      router.parseUrl.mockReturnValue({
        queryParamMap: {
          get: vi.fn().mockReturnValue(returnUrl),
        },
      });

      const result = firstValueFrom(effects.loginSuccess$);

      actions$.next(
        loginSuccess({
          user: {
            id: '1',
            username: 'user',
            role: 'CUSTOMER',
          },
          token: 'token',
        }),
      );

      await result;

      expect(router.navigateByUrl).toHaveBeenCalledWith('/products');
    },
  );
});
