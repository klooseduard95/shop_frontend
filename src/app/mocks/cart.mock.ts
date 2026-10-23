import { CartItem } from '../features/shared/types/cart.types';
import { createMockProduct } from './products.mock';

export const createMockCartItem = (overrides?: Partial<CartItem>): CartItem => {
  return {
    product: createMockProduct(),
    quantity: 1,
    ...overrides,
  };
};

export const MOCK_CART_ITEMS: CartItem[] = [
  createMockCartItem({
    product: createMockProduct({
      id: '1',
      name: 'Wireless Headphones',
      categoryName: 'Electronics',
      categoryDescription: 'High-quality wireless headphones with noise cancellation.',
      price: 199.99,
      imageUrl: 'https://via.placeholder.com/150',
    }),
    quantity: 3,
  }),
  createMockCartItem({
    product: createMockProduct({
      id: '2',
      name: 'Mechanical Keyboard',
      categoryName: 'Peripherals',
      categoryDescription: 'RGB mechanical keyboard with blue switches.',
      price: 89.5,
      imageUrl: 'https://via.placeholder.com/150',
    }),
    quantity: 2,
  }),
];
