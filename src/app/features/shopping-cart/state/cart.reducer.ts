import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { CartItem } from '../types/cart.types';
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

export const cartFeatureKey = 'cart';

export interface CartState extends EntityState<CartItem> {
  ownerKey: string | null;
  revision: number;
  loading: boolean;
  error: string | null;
}

export const cartAdapter = createEntityAdapter<CartItem>({
  selectId: (item) => item.productId,
});

export const initialCartState: CartState = cartAdapter.getInitialState({
  ownerKey: null,
  revision: 0,
  loading: false,
  error: null,
});

export const cartReducer = createReducer(
  initialCartState,
  on(addToCart, (state, { productId }) => {
    const existingItem = state.entities[productId];

    return existingItem
      ? cartAdapter.updateOne(
          {
            id: productId,
            changes: {
              quantity: existingItem.quantity + 1,
            },
          },
          state,
        )
      : cartAdapter.addOne(
          {
            productId,
            quantity: 1,
          },
          state,
        );
  }),

  on(removeFromCart, (state, { productId }) => cartAdapter.removeOne(productId, state)),

  on(checkout, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(checkoutSuccess, (state) =>
    cartAdapter.removeAll({
      ...state,
      loading: false,
      error: null,
    }),
  ),

  on(checkoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(cartHydrated, (state, { ownerKey, items, revision }) => {
    const ownerChanged = state.ownerKey !== ownerKey;

    return cartAdapter.setAll(items, {
      ...state,
      ownerKey,
      revision,
      loading: ownerChanged ? false : state.loading,
      error: ownerChanged ? null : state.error,
    });
  }),

  on(cartPersisted, (state, { revision }) => ({
    ...state,
    revision,
  })),

  on(cartSyncedFromAnotherTab, (state, { items, revision }) =>
    cartAdapter.setAll(items, {
      ...state,
      revision,
    }),
  ),
);
