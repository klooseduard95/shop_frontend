import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { authInitialized, loginSuccess, logout } from '../../auth/state/auth.actions';
import { createMockProduct } from '../../../mocks/products.mock';
import { CartStorageService } from '../services/cart-storage.service';
import { CartService } from '../services/cart.service';
import { CartStorageChange, PersistedCart } from '../types/cart.types';
import {
  addToCart,
  cartHydrated,
  cartPersisted,
  cartSyncedFromAnotherTab,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';
import { CartEffects } from './cart.effects';

describe('CartEffects', () => {
  let actions$: ReplaySubject<Action>;
  let storageChanges$: Subject<CartStorageChange>;
  let effects: CartEffects;
  let store: MockStore;

  let cartService: {
    checkout: ReturnType<typeof vi.fn>;
  };

  let cartStorage: {
    writerId: string;
    changes$: Subject<CartStorageChange>;
    ownerKeyFor: ReturnType<typeof vi.fn>;
    read: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    claimGuestCart: ReturnType<typeof vi.fn>;
  };

  const product = createMockProduct();

  const user = {
    id: 'user-1',
    username: 'customer',
    role: 'CUSTOMER' as const,
  };

  const deliveryAddress = {
    country: 'Romania',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    streetAddress: 'Test Street 1',
  };

  const emptyPersistedCart: PersistedCart = {
    items: [],
    revision: 0,
    updatedAt: 0,
    writerId: '',
  };

  const createState = ({
    currentUser = user,
    items = [
      {
        productId: product.id,
        quantity: 2,
      },
    ],
    ownerKey = 'cart:user:user-1',
    revision = 0,
  }: {
    currentUser?: typeof user | null;
    items?: Array<{
      productId: string;
      quantity: number;
    }>;
    ownerKey?: string | null;
    revision?: number;
  } = {}) => ({
    auth: {
      user: currentUser,
      token: currentUser ? 'token' : null,
      initialized: true,
      loading: false,
      error: null,
    },
    cart: {
      items,
      ownerKey,
      revision,
      loading: false,
      error: null,
    },
  });

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    storageChanges$ = new Subject<CartStorageChange>();

    cartService = {
      checkout: vi.fn(),
    };

    cartStorage = {
      writerId: 'current-tab',
      changes$: storageChanges$,
      ownerKeyFor: vi.fn((currentUser) =>
        currentUser ? `cart:user:${currentUser.id}` : CartStorageService.guestOwnerKey,
      ),
      read: vi.fn().mockReturnValue(emptyPersistedCart),
      write: vi.fn().mockReturnValue({
        items: [
          {
            productId: product.id,
            quantity: 2,
          },
        ],
        revision: 1,
        updatedAt: 100,
        writerId: 'current-tab',
      }),
      claimGuestCart: vi.fn().mockReturnValue([]),
    };

    TestBed.configureTestingModule({
      providers: [
        CartEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: createState(),
        }),
        {
          provide: CartService,
          useValue: cartService,
        },
        {
          provide: CartStorageService,
          useValue: cartStorage,
        },
      ],
    });

    effects = TestBed.inject(CartEffects);
    store = TestBed.inject(MockStore);
  });

  it('should checkout the current cart', async () => {
    cartService.checkout.mockReturnValue(of(undefined));

    const result = firstValueFrom(effects.checkout$);

    actions$.next(checkout({ deliveryAddress }));

    await expect(result).resolves.toEqual(checkoutSuccess());

    expect(cartService.checkout).toHaveBeenCalledWith({
      userId: 'user-1',
      deliveryAddress,
      products: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
    });
  });

  it('should report checkout service failures', async () => {
    cartService.checkout.mockReturnValue(throwError(() => new Error('Checkout failed')));

    const result = firstValueFrom(effects.checkout$);

    actions$.next(checkout({ deliveryAddress }));

    await expect(result).resolves.toEqual(
      checkoutFailure({
        error: 'Checkout failed',
      }),
    );
  });

  it('should reject checkout without a signed-in user', async () => {
    store.setState(
      createState({
        currentUser: null,
      }),
    );
    store.refreshState();

    const result = firstValueFrom(effects.checkout$);

    actions$.next(checkout({ deliveryAddress }));

    await expect(result).resolves.toEqual(
      checkoutFailure({
        error: 'A signed-in customer and a non-empty cart are required.',
      }),
    );

    expect(cartService.checkout).not.toHaveBeenCalled();
  });

  it('should reject checkout with an empty cart', async () => {
    store.setState(
      createState({
        items: [],
      }),
    );
    store.refreshState();

    const result = firstValueFrom(effects.checkout$);

    actions$.next(checkout({ deliveryAddress }));

    await expect(result).resolves.toEqual(
      checkoutFailure({
        error: 'A signed-in customer and a non-empty cart are required.',
      }),
    );

    expect(cartService.checkout).not.toHaveBeenCalled();
  });

  it('should hydrate a signed-in cart and claim guest items', async () => {
    const pendingItem = {
      productId: 'pending-product',
      quantity: 1,
    };

    const guestItem = {
      productId: 'guest-product',
      quantity: 2,
    };

    store.setState(
      createState({
        items: [pendingItem],
        ownerKey: null,
      }),
    );
    store.refreshState();

    cartStorage.claimGuestCart.mockReturnValue([guestItem]);
    cartStorage.read.mockReturnValue({
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      revision: 3,
      updatedAt: 100,
      writerId: 'old-tab',
    });

    const persisted = {
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
        guestItem,
        pendingItem,
      ],
      revision: 4,
      updatedAt: 200,
      writerId: 'current-tab',
    };

    cartStorage.write.mockReturnValue(persisted);

    const result = firstValueFrom(effects.hydrateCart$);

    actions$.next(loginSuccess({ user, token: 'token' }));

    await expect(result).resolves.toEqual(
      cartHydrated({
        ownerKey: 'cart:user:user-1',
        items: persisted.items,
        revision: 4,
      }),
    );

    expect(cartStorage.claimGuestCart).toHaveBeenCalled();
    expect(cartStorage.write).toHaveBeenCalledWith('cart:user:user-1', persisted.items);
  });

  it('should hydrate an unchanged guest cart without writing it', async () => {
    const stored = {
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      revision: 3,
      updatedAt: 100,
      writerId: 'guest-tab',
    };

    store.setState(
      createState({
        currentUser: null,
        items: [],
        ownerKey: 'cart:guest',
      }),
    );
    store.refreshState();

    cartStorage.read.mockReturnValue(stored);

    const result = firstValueFrom(effects.hydrateCart$);

    actions$.next(authInitialized());

    await expect(result).resolves.toEqual(
      cartHydrated({
        ownerKey: CartStorageService.guestOwnerKey,
        items: stored.items,
        revision: stored.revision,
      }),
    );

    expect(cartStorage.claimGuestCart).not.toHaveBeenCalled();
    expect(cartStorage.write).not.toHaveBeenCalled();
  });

  it('should hydrate the guest cart after logout', async () => {
    store.setState(
      createState({
        currentUser: null,
        items: [],
        ownerKey: null,
      }),
    );
    store.refreshState();

    const result = firstValueFrom(effects.hydrateCart$);

    actions$.next(logout());

    await expect(result).resolves.toEqual(
      cartHydrated({
        ownerKey: CartStorageService.guestOwnerKey,
        items: [],
        revision: 0,
      }),
    );
  });

  it.each([
    addToCart({ productId: product.id }),
    removeFromCart({ productId: product.id }),
    checkoutSuccess(),
  ])('should persist cart-changing actions', async (action) => {
    cartStorage.write.mockReturnValue({
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      revision: 6,
      updatedAt: 100,
      writerId: 'current-tab',
    });

    const result = firstValueFrom(effects.persistCart$);

    actions$.next(action);

    await expect(result).resolves.toEqual(cartPersisted({ revision: 6 }));

    expect(cartStorage.write).toHaveBeenCalledWith('cart:user:user-1', [
      {
        productId: product.id,
        quantity: 2,
      },
    ]);
  });

  it('should not persist before cart ownership is known', () => {
    store.setState(
      createState({
        ownerKey: null,
      }),
    );
    store.refreshState();

    const emitted = vi.fn();
    const subscription = effects.persistCart$.subscribe(emitted);

    actions$.next(addToCart({ productId: product.id }));

    expect(emitted).not.toHaveBeenCalled();
    expect(cartStorage.write).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should clear the cart when storage is cleared', async () => {
    const result = firstValueFrom(effects.syncCartBetweenTabs$);

    storageChanges$.next({
      ownerKey: null,
      cart: null,
    });

    await expect(result).resolves.toEqual(
      cartSyncedFromAnotherTab({
        items: [],
        revision: 0,
      }),
    );
  });

  it('should clear the current cart when its storage entry is removed', async () => {
    const result = firstValueFrom(effects.syncCartBetweenTabs$);

    storageChanges$.next({
      ownerKey: 'cart:user:user-1',
      cart: null,
    });

    await expect(result).resolves.toEqual(
      cartSyncedFromAnotherTab({
        items: [],
        revision: 0,
      }),
    );
  });

  it('should apply a newer cart from another tab', async () => {
    const remoteItems = [
      {
        productId: product.id,
        quantity: 5,
      },
    ];

    const result = firstValueFrom(effects.syncCartBetweenTabs$);

    storageChanges$.next({
      ownerKey: 'cart:user:user-1',
      cart: {
        items: remoteItems,
        revision: 5,
        updatedAt: 200,
        writerId: 'other-tab',
      },
    });

    await expect(result).resolves.toEqual(
      cartSyncedFromAnotherTab({
        items: remoteItems,
        revision: 5,
      }),
    );
  });

  it.each([
    {
      name: 'cart ownership is not known',
      state: createState({ ownerKey: null }),
      change: {
        ownerKey: 'cart:user:user-1',
        cart: emptyPersistedCart,
      },
    },
    {
      name: 'the change belongs to another owner',
      state: createState(),
      change: {
        ownerKey: 'cart:user:user-2',
        cart: emptyPersistedCart,
      },
    },
    {
      name: 'the current tab wrote the change',
      state: createState(),
      change: {
        ownerKey: 'cart:user:user-1',
        cart: {
          items: [],
          revision: 5,
          updatedAt: 100,
          writerId: 'current-tab',
        },
      },
    },
    {
      name: 'the change has an older revision',
      state: createState({ revision: 5 }),
      change: {
        ownerKey: 'cart:user:user-1',
        cart: {
          items: [],
          revision: 4,
          updatedAt: 100,
          writerId: 'other-tab',
        },
      },
    },
    {
      name: 'the change has the same revision',
      state: createState({ revision: 5 }),
      change: {
        ownerKey: 'cart:user:user-1',
        cart: {
          items: [],
          revision: 5,
          updatedAt: 100,
          writerId: 'other-tab',
        },
      },
    },
  ])('should ignore a remote change when $name', ({ state, change }) => {
    store.setState(state);
    store.refreshState();

    const emitted = vi.fn();
    const subscription = effects.syncCartBetweenTabs$.subscribe(emitted);

    storageChanges$.next(change);

    expect(emitted).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });
});
