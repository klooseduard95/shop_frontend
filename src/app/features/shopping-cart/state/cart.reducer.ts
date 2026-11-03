import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { CartItem, CartItemDetails } from '../types/cart.types';
import { selectAllProducts } from '../../products/state/products.reducer';
import {
  addToCart,
  cartHydrated,
  cartPersisted,
  cartSyncedFromAnotherTab,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';

export interface CartState {
  items: CartItem[];
  /** `null` until the owning session is known; blocks persistence before hydration. */
  ownerKey: string | null;
  revision: number;
  loading: boolean;
  error: string | null;
}

const initialCartState: CartState = {
  items: [],
  ownerKey: null,
  revision: 0,
  loading: false,
  error: null,
};

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
  on(cartHydrated, (state, { ownerKey, items, revision }) => {
    const ownerChanged = state.ownerKey !== ownerKey;

    return {
      ...state,
      ownerKey,
      items,
      revision,
      loading: ownerChanged ? false : state.loading,
      error: ownerChanged ? null : state.error,
    };
  }),
  on(cartPersisted, (state, { revision }) => ({ ...state, revision })),
  on(cartSyncedFromAnotherTab, (state, { items, revision }) => ({ ...state, items, revision })),
);

export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectCartItems = createSelector(selectCartState, (state) => state.items);
export const selectCartError = createSelector(selectCartState, (state) => state.error);
export const selectCartOwnerKey = createSelector(selectCartState, (state) => state.ownerKey);
export const selectCartRevision = createSelector(selectCartState, (state) => state.revision);
export const selectCartItemDetails = createSelector(
  selectCartItems,
  selectAllProducts,
  (items, products) =>
    items.reduce<CartItemDetails[]>((details, item) => {
      const product = products.find(({ id }) => id === item.productId);
      return product ? [...details, { ...item, product }] : details;
    }, []),
);
export const selectCartTotal = createSelector(selectCartItemDetails, (items) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0),
);
