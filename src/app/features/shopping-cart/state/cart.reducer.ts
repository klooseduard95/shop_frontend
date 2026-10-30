import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { CartState } from '../../../app.state';
import {
  addToCart,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';

const initialCartState: CartState = { items: [], loading: false, error: null };

export const cartReducer = createReducer(
  initialCartState,
  on(addToCart, (state, { product }) => {
    const exists = state.items.some((item) => item.product.id === product.id);
    const updatedItems = exists
      ? state.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...state.items, { product, quantity: 1 }];
    return { ...state, items: updatedItems };
  }),
  on(removeFromCart, (state, { productId }) => ({
    ...state,
    items: state.items.filter((item) => item.product.id !== productId),
  })),
  on(checkout, (state) => ({ ...state, loading: true, error: null })),
  on(checkoutSuccess, (state) => ({ ...state, items: [], loading: false, error: null })),
  on(checkoutFailure, (state, { error }) => ({ ...state, loading: false, error })),
);

export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectCartItems = createSelector(selectCartState, (state) => state.items);
export const selectCartError = createSelector(selectCartState, (state) => state.error);
export const selectCartTotal = createSelector(selectCartState, (state) =>
  state.items.reduce((total, item) => total + item.product.price * item.quantity, 0),
);
