import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TestBed } from '@angular/core/testing';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

describe('application routes', () => {
  let router: Router;
  let store: MockStore;

  const stateFor = (user: { id: string; username: string; role: 'ADMIN' | 'CUSTOMER' } | null) => ({
    auth: {
      ids: user ? [user.id] : [],
      entities: user ? { [user.id]: user } : {},
      currentUserId: user?.id ?? null,
      token: user ? 'token' : null,
      initialized: true,
      loading: false,
      error: null,
    },
    products: {
      ids: [],
      entities: {},
      selectedProductId: null,
      loading: false,
      error: null,
      saving: false,
      saveError: null,
    },
    cart: {
      ids: [],
      entities: {},
      ownerKey: null,
      revision: 0,
      loading: false,
      error: null,
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideMockStore({ initialState: stateFor(null) })],
    });

    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);
  });

  it('should redirect an unauthenticated visitor to login with the requested protected URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/products/product-1');

    expect(router.url).toBe('/login?returnUrl=%2Fproducts%2Fproduct-1');
  });

  it('should allow an authenticated customer to navigate to product details', async () => {
    store.setState(
      stateFor({
        id: 'customer-1',
        username: 'customer',
        role: 'CUSTOMER',
      }),
    );

    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/products/product-1');

    expect(router.url).toBe('/products/product-1');
  });

  it('should redirect a customer away from the create-product route', async () => {
    store.setState(
      stateFor({
        id: 'customer-1',
        username: 'customer',
        role: 'CUSTOMER',
      }),
    );

    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/products/new');

    expect(router.url).toBe('/products');
  });

  it('should allow an administrator to navigate to product editing', async () => {
    store.setState(
      stateFor({
        id: 'admin-1',
        username: 'admin',
        role: 'ADMIN',
      }),
    );

    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/products/product-1/edit');

    expect(router.url).toBe('/products/product-1/edit');
  });
});
