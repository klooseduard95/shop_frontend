import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, firstValueFrom, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../products/services/products.service';
import { CartService } from '../../shopping-cart/services/cart.service';
import {
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
} from './app.actions';

describe('AppEffects authentication', () => {
  let actions$: ReplaySubject<Action>;
  let effects: AppEffects;
  let authService: {
    getStoredToken: ReturnType<typeof vi.fn>;
    getProfile: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    storeToken: ReturnType<typeof vi.fn>;
    clearStoredToken: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    authService = {
      getStoredToken: vi.fn(),
      getProfile: vi.fn(),
      login: vi.fn(),
      storeToken: vi.fn(),
      clearStoredToken: vi.fn(),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            auth: {
              user: null,
              token: null,
              initialized: true,
              loading: false,
              error: null,
            },
            cart: { items: [], loading: false, error: null },
          },
        }),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ProductsService, useValue: {} },
        { provide: CartService, useValue: {} },
      ],
    });

    effects = TestBed.inject(AppEffects);
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
    const user = { id: '1', username: 'user', role: 'CUSTOMER' as const };
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
    const credentials = { username: 'user', password: 'password' };
    const user = { id: '1', username: 'user', role: 'CUSTOMER' as const };
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

    actions$.next(login({ credentials: { username: 'user' } }));

    await expect(result).resolves.toEqual(
      loginFailure({ error: 'Invalid credentials. Please try again.' }),
    );
  });

  it('should persist and navigate after login success', async () => {
    const action = loginSuccess({
      user: { id: '1', username: 'user', role: 'CUSTOMER' },
      token: 'token',
    });
    const result = firstValueFrom(effects.loginSuccess$);

    actions$.next(action);
    await result;

    expect(authService.storeToken).toHaveBeenCalledWith('token');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should clear persistence and navigate on logout', async () => {
    const result = firstValueFrom(effects.logout$);

    actions$.next(logout());
    await result;

    expect(authService.clearStoredToken).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
