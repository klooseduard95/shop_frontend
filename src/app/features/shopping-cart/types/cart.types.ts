import { Product } from '../../products/types/products.types';

export interface CartItem {
  product: Product;
  quantity: number;
}
