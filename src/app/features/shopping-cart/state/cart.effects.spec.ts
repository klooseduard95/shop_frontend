import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';
import { createMockProduct } from '../../../mocks/products.mock';
import { CartService } from '../services/cart.service';
import { checkout, checkoutFailure, checkoutSuccess } from './cart.actions';
import { CartEffects } from './cart.effects';

describe('CartEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: CartEffects;
  let cartService: { checkout: ReturnType<typeof vi.fn> };

  const product = createMockProduct();
  const deliveryAddress = {
    country: 'Romania',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    streetAddress: 'Test Street 1',
  };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    cartService = { checkout: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        CartEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            auth: {
              user: { id: 'user-1', username: 'customer', role: 'CUSTOMER' },
              token: 'token',
              initialized: true,
              loading: false,
              error: null,
            },
            cart: { items: [{ productId: product.id, quantity: 2 }], loading: false, error: null },
          },
        }),
        { provide: CartService, useValue: cartService },
      ],
    });

    effects = TestBed.inject(CartEffects);
  });

  it('should checkout the current cart', async () => {
    cartService.checkout.mockReturnValue(of(undefined));
    const result = firstValueFrom(effects.checkout$);

    actions$.next(checkout({ deliveryAddress }));

    await expect(result).resolves.toEqual(checkoutSuccess());
    expect(cartService.checkout).toHaveBeenCalledWith({
      userId: 'user-1',
      deliveryAddress,
      products: [{ productId: product.id, quantity: 2 }],
    });
  });

  it('should report checkout failures', async () => {
    cartService.checkout.mockReturnValue(throwError(() => new Error('Checkout failed')));
    const result = firstValueFrom(effects.checkout$);

    actions$.next(checkout({ deliveryAddress }));

    await expect(result).resolves.toEqual(checkoutFailure({ error: 'Checkout failed' }));
  });
});
