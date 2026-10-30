import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { CartItem, CartItemDetails } from '../types/cart.types';
import { selectAllProducts } from '../../products/state/products.reducer';
import {
  addToCart,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialCartState: CartState = { items: [], loading: false, error: null };

export const cartReducer = createReducer(
  initialCartState,
  on(addToCart, (state, { productId }) => {
    const exists = state.items.some((item) => item.productId === productId);
    const updatedItems = exists
      ? state.items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...state.items, { productId, quantity: 1 }];
    return { ...state, items: updatedItems };
  }),
  on(removeFromCart, (state, { productId }) => ({
    ...state,
    items: state.items.filter((item) => item.productId !== productId),
  })),
  on(checkout, (state) => ({ ...state, loading: true, error: null })),
  on(checkoutSuccess, (state) => ({ ...state, items: [], loading: false, error: null })),
  on(checkoutFailure, (state, { error }) => ({ ...state, loading: false, error })),
);

export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectCartItems = createSelector(selectCartState, (state) => state.items);
export const selectCartError = createSelector(selectCartState, (state) => state.error);
export const selectCartItemDetails = createSelector(selectCartItems, selectAllProducts, (items, products) =>
  items.reduce<CartItemDetails[]>((details, item) => {
    const product = products.find(({ id }) => id === item.productId);
    return product ? [...details, { ...item, product }] : details;
  }, []),
);
export const selectCartTotal = createSelector(selectCartItemDetails, (items) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0),
);
