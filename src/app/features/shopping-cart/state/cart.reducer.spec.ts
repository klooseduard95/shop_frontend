import { createMockProduct } from '../../../mocks/products.mock';
import {
  addToCart,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';
import { cartReducer, selectCartTotal } from './cart.reducer';

describe('cartReducer', () => {
  const product = createMockProduct({ price: 10 });

  it('should add, increment, and remove products', () => {
    const added = cartReducer(undefined, addToCart({ product }));
    const incremented = cartReducer(added, addToCart({ product }));
    const removed = cartReducer(incremented, removeFromCart({ productId: product.id }));

    expect(added.items).toEqual([{ product, quantity: 1 }]);
    expect(incremented.items).toEqual([{ product, quantity: 2 }]);
    expect(removed.items).toEqual([]);
  });

  it('should track checkout progress, failure, and success', () => {
    const withItem = cartReducer(undefined, addToCart({ product }));
    const loading = cartReducer(
      withItem,
      checkout({
        deliveryAddress: {
          country: 'Romania',
          city: 'Cluj-Napoca',
          county: 'Cluj',
          streetAddress: 'Test Street 1',
        },
      }),
    );
    const failed = cartReducer(loading, checkoutFailure({ error: 'Checkout failed' }));
    const completed = cartReducer(failed, checkoutSuccess());

    expect(loading).toMatchObject({ loading: true, error: null });
    expect(failed).toMatchObject({ loading: false, error: 'Checkout failed' });
    expect(completed).toMatchObject({ items: [], loading: false, error: null });
  });

  it('should calculate the cart total', () => {
    expect(
      selectCartTotal.projector({
        items: [{ product, quantity: 3 }],
        loading: false,
        error: null,
      }),
    ).toBe(30);
  });
});
