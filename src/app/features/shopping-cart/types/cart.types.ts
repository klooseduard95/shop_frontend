import { Product } from '../../products/types/products.types';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemDetails extends CartItem {
  product: Product;
}
