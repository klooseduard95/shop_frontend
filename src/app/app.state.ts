import { Product } from './features/products/types/products.types';
import { UserProfile } from './features/shared/types/users.types';
import { CartItem } from './features/shopping-cart/types/cart.types';

export interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

export interface AppState {
  products: ProductsState;
  auth: AuthState;
  cart: CartState;
}
