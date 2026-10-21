import { Product } from '../features/shared/types/products.types';

export const MOCK_PRODUCTS: Product[]  = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: 'Electronics',
    description: "High-quality wireless headphones with noise cancellation.",
    price: 199.99,
    imageUrl: "https://via.placeholder.com/150"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    category: 'Peripherals',
    description: "RGB mechanical keyboard with blue switches.",
    price: 89.50,
    imageUrl: "https://via.placeholder.com/150"
  },
  {
    id: 3,
    name: 'Gaming Mouse',
    category: 'Peripherals',
    description: 'Ergonomic gaming mouse with customizable DPI settings.',
    price: 49.99,
    imageUrl: 'https://via.placeholder.com/150'
  }
]
