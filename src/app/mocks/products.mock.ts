import { Product } from '../features/products/types/products.types';

export const createMockProduct = (overrides?: Partial<Product>): Product => {
  return {
    id: '1',
    name: 'Default Product name',
    price: 0,
    weight: 0,
    categoryId: '1',
    categoryName: 'Default Product category',
    categoryDescription: 'Default Product description',
    imageUrl: 'https://via.placeholder.com/150',
    ...overrides,
  };
};
export const MOCK_PRODUCTS: Product[] = [
  createMockProduct({
    id: '1',
    name: 'Wireless Headphones',
    categoryId: '1',
    categoryName: 'Electronics',
    categoryDescription: 'High-quality wireless headphones with noise cancellation.',
    price: 199.99,
    weight: 0,
    imageUrl: 'https://via.placeholder.com/150',
  }),
  createMockProduct({
    id: '2',
    name: 'Mechanical Keyboard',
    categoryId: '2',
    categoryName: 'Peripherals',
    categoryDescription: 'RGB mechanical keyboard with blue switches.',
    price: 89.5,
    weight: 0,
    imageUrl: 'https://via.placeholder.com/150',
  }),
  createMockProduct({
    id: '3',
    name: 'Gaming Mouse',
    categoryId: '2',
    categoryName: 'Peripherals',
    categoryDescription: 'Ergonomic gaming mouse with customizable DPI settings.',
    price: 49.99,
    weight: 0,
    imageUrl: 'https://via.placeholder.com/150',
  }),
];
