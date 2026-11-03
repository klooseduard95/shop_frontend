import { createMockProduct } from '../../../mocks/products.mock';
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
import {
  cartReducer,
  CartState,
  selectCartError,
  selectCartItemDetails,
  selectCartItems,
  selectCartOwnerKey,
  selectCartRevision,
  selectCartTotal,
} from './cart.reducer';

describe('cartReducer', () => {
  const product = createMockProduct({ price: 10 });
  const otherProduct = createMockProduct({
    id: 'product-2',
    name: 'Other product',
    price: 20,
  });

  const deliveryAddress = {
    country: 'Romania',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    streetAddress: 'Test Street 1',
  };

  it('should return the initial state for an unknown action', () => {
    expect(cartReducer(undefined, { type: 'Unknown' })).toEqual({
      items: [],
      ownerKey: null,
      revision: 0,
      loading: false,
      error: null,
    });
  });

  it('should add a new product', () => {
    const state = cartReducer(undefined, addToCart({ productId: product.id }));

    expect(state.items).toEqual([
      {
        productId: product.id,
        quantity: 1,
      },
    ]);
  });

  it('should increment an existing product without changing others', () => {
    let state = cartReducer(undefined, addToCart({ productId: product.id }));

    state = cartReducer(state, addToCart({ productId: otherProduct.id }));

    state = cartReducer(state, addToCart({ productId: product.id }));

    expect(state.items).toEqual([
      {
        productId: product.id,
        quantity: 2,
      },
      {
        productId: otherProduct.id,
        quantity: 1,
      },
    ]);
  });

  it('should remove only the requested product', () => {
    let state = cartReducer(undefined, addToCart({ productId: product.id }));

    state = cartReducer(state, addToCart({ productId: otherProduct.id }));

    state = cartReducer(state, removeFromCart({ productId: product.id }));

    expect(state.items).toEqual([
      {
        productId: otherProduct.id,
        quantity: 1,
      },
    ]);
  });

  it('should track checkout progress, failure, and success', () => {
    const withItem = cartReducer(undefined, addToCart({ productId: product.id }));

    const loading = cartReducer(withItem, checkout({ deliveryAddress }));

    const failed = cartReducer(
      loading,
      checkoutFailure({
        error: 'Checkout failed',
      }),
    );

    const completed = cartReducer(failed, checkoutSuccess());

    expect(loading).toMatchObject({
      loading: true,
      error: null,
    });

    expect(failed).toMatchObject({
      loading: false,
      error: 'Checkout failed',
    });

    expect(completed).toMatchObject({
      items: [],
      loading: false,
      error: null,
    });
  });

  it('should reset loading and errors when the owner changes', () => {
    let state = cartReducer(undefined, checkout({ deliveryAddress }));

    state = cartReducer(
      state,
      checkoutFailure({
        error: 'Checkout failed',
      }),
    );

    const hydrated = cartReducer(
      state,
      cartHydrated({
        ownerKey: 'cart:user:user-1',
        items: [
          {
            productId: product.id,
            quantity: 2,
          },
        ],
        revision: 3,
      }),
    );

    expect(hydrated).toEqual({
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      ownerKey: 'cart:user:user-1',
      revision: 3,
      loading: false,
      error: null,
    });
  });

  it('should preserve loading and errors when hydrating the same owner', () => {
    const state: CartState = {
      items: [],
      ownerKey: 'cart:user:user-1',
      revision: 1,
      loading: true,
      error: 'Existing error',
    };

    const hydrated = cartReducer(
      state,
      cartHydrated({
        ownerKey: 'cart:user:user-1',
        items: [
          {
            productId: product.id,
            quantity: 1,
          },
        ],
        revision: 2,
      }),
    );

    expect(hydrated).toMatchObject({
      loading: true,
      error: 'Existing error',
      revision: 2,
    });
  });

  it('should update the persisted revision', () => {
    const state = cartReducer(undefined, cartPersisted({ revision: 4 }));

    expect(state.revision).toBe(4);
  });

  it('should apply cart changes received from another tab', () => {
    const items = [
      {
        productId: product.id,
        quantity: 3,
      },
    ];

    const state = cartReducer(
      undefined,
      cartSyncedFromAnotherTab({
        items,
        revision: 7,
      }),
    );

    expect(state).toMatchObject({
      items,
      revision: 7,
    });
  });

  it('should join cart items with available products', () => {
    const details = selectCartItemDetails.projector(
      [
        {
          productId: product.id,
          quantity: 3,
        },
        {
          productId: 'missing-product',
          quantity: 1,
        },
      ],
      [product],
    );

    expect(details).toEqual([
      {
        productId: product.id,
        quantity: 3,
        product,
      },
    ]);
  });

  it('should calculate the cart total', () => {
    const details = selectCartItemDetails.projector(
      [
        {
          productId: product.id,
          quantity: 3,
        },
        {
          productId: otherProduct.id,
          quantity: 2,
        },
      ],
      [product, otherProduct],
    );

    expect(selectCartTotal.projector(details)).toBe(70);
  });

  it('should project cart state values', () => {
    const state: CartState = {
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      ownerKey: 'cart:user:user-1',
      revision: 5,
      loading: false,
      error: 'Cart error',
    };

    expect(selectCartItems.projector(state)).toEqual(state.items);
    expect(selectCartError.projector(state)).toBe('Cart error');
    expect(selectCartOwnerKey.projector(state)).toBe('cart:user:user-1');
    expect(selectCartRevision.projector(state)).toBe(5);
  });
});
