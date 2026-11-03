import { Product } from '../../products/types/products.types';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemDetails extends CartItem {
  product: Product;
}

export interface PersistedCart {
  items: CartItem[];
  revision: number;
  updatedAt: number;
  writerId: string;
}

export interface CartStorageChange {
  ownerKey: string | null;
  cart: PersistedCart | null;
}
