import { createMockProduct } from '../../../mocks/products.mock';
import {
  addToCart,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';
import { cartReducer, selectCartItemDetails, selectCartTotal } from './cart.reducer';

describe('cartReducer', () => {
  const product = createMockProduct({ price: 10 });

  it('should add, increment, and remove products', () => {
    const added = cartReducer(undefined, addToCart({ productId: product.id }));
    const incremented = cartReducer(added, addToCart({ productId: product.id }));
    const removed = cartReducer(incremented, removeFromCart({ productId: product.id }));

    expect(added.items).toEqual([{ productId: product.id, quantity: 1 }]);
    expect(incremented.items).toEqual([{ productId: product.id, quantity: 2 }]);
    expect(removed.items).toEqual([]);
  });

  it('should track checkout progress, failure, and success', () => {
    const withItem = cartReducer(undefined, addToCart({ productId: product.id }));
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

  it('should calculate the cart total from current product data', () => {
    const items = [{ productId: product.id, quantity: 3 }];
    const cartItems = selectCartItemDetails.projector(items, [product]);

    expect(selectCartTotal.projector(cartItems)).toBe(30);

    const updatedProduct = { ...product, price: 12 };
    expect(selectCartTotal.projector(selectCartItemDetails.projector(items, [updatedProduct]))).toBe(36);
  });
});
