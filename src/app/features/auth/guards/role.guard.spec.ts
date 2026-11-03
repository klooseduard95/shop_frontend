import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, Observable } from 'rxjs';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let store: MockStore;
  let router: Router;

  const runGuard = (role: 'ADMIN' | 'CUSTOMER'): Observable<boolean | UrlTree> =>
    TestBed.runInInjectionContext(
      () =>
        roleGuard(
          {
            data: { role },
          } as unknown as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
        ) as Observable<boolean | UrlTree>,
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            auth: {
              ids: [],
              entities: {},
              currentUserId: null,
              token: null,
              initialized: true,
              loading: false,
              error: null,
            },
          },
        }),
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn((commands: string[]) => ({ commands }) as unknown as UrlTree),
          },
        },
      ],
    });

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
  });

  it('should redirect anonymous users to login', async () => {
    await expect(firstValueFrom(runGuard('ADMIN'))).resolves.toEqual({ commands: ['/login'] });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should allow a user with the expected role', async () => {
    store.setState({
      auth: {
        ids: ['admin-1'],
        entities: {
          'admin-1': {
            id: 'admin-1',
            username: 'admin',
            role: 'ADMIN',
          },
        },
        currentUserId: 'admin-1',
        token: 'token',
        initialized: true,
        loading: false,
        error: null,
      },
    });

    await expect(firstValueFrom(runGuard('ADMIN'))).resolves.toBe(true);
  });

  it('should redirect a user with a different role to products', async () => {
    store.setState({
      auth: {
        ids: ['customer-1'],
        entities: {
          'customer-1': {
            id: 'customer-1',
            username: 'customer',
            role: 'CUSTOMER',
          },
        },
        currentUserId: 'customer-1',
        token: 'token',
        initialized: true,
        loading: false,
        error: null,
      },
    });

    await expect(firstValueFrom(runGuard('ADMIN'))).resolves.toEqual({ commands: ['/products'] });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/products']);
  });

  it('should wait until authentication is initialized', async () => {
    store.setState({
      auth: {
        ids: [],
        entities: {},
        currentUserId: null,
        token: null,
        initialized: false,
        loading: false,
        error: null,
      },
    });

    const result = firstValueFrom(runGuard('CUSTOMER'));

    store.setState({
      auth: {
        ids: ['customer-1'],
        entities: {
          'customer-1': {
            id: 'customer-1',
            username: 'customer',
            role: 'CUSTOMER',
          },
        },
        currentUserId: 'customer-1',
        token: 'token',
        initialized: true,
        loading: false,
        error: null,
      },
    });

    store.refreshState();

    await expect(result).resolves.toBe(true);
  });
});
