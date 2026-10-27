import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

describe('auth guards', () => {
  let store: MockStore;
  let router: Router;

  const state = (
    user: { id: string; username: string; role: 'ADMIN' | 'CUSTOMER' } | null,
    initialized = true,
  ) => ({
    auth: {
      user,
      token: user ? 'token' : null,
      initialized,
      loading: !initialized,
      error: null,
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideMockStore({ initialState: state(null) })],
    });
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
  });

  it('should wait for initialization before allowing an authenticated user', async () => {
    store.setState(state(null, false));
    const result = firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<boolean | UrlTree>,
    );

    store.setState(state({ id: '1', username: 'admin', role: 'ADMIN' }));

    await expect(result).resolves.toBe(true);
  });

  it('should redirect a signed-out user to login', async () => {
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<boolean | UrlTree>,
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('should enforce the expected role', async () => {
    store.setState(state({ id: '1', username: 'customer', role: 'CUSTOMER' }));
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        roleGuard(
          { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
        ),
      ) as Observable<boolean | UrlTree>,
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/products');
  });

  it('should allow a user with the expected role', async () => {
    store.setState(state({ id: '1', username: 'admin', role: 'ADMIN' }));
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        roleGuard(
          { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
        ),
      ) as Observable<boolean | UrlTree>,
    );

    expect(result).toBe(true);
  });
});
