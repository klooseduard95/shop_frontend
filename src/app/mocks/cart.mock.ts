import { CartItem } from '../features/shopping-cart/types/cart.types';

export const createMockCartItem = (overrides?: Partial<CartItem>): CartItem => {
  return {
    productId: 'product-1',
    quantity: 1,
    ...overrides,
  };
};

export const MOCK_CART_ITEMS: CartItem[] = [
  createMockCartItem({
    productId: '1',
    quantity: 3,
  }),
  createMockCartItem({
    productId: '2',
    quantity: 2,
  }),
];
