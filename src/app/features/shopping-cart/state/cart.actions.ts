import { createAction, props } from '@ngrx/store';
import { CartItem } from '../types/cart.types';
import { AddressRequest } from '../types/order.types';

export const addToCart = createAction(
  '[Products Details] Add To Cart',
  props<{ productId: string }>(),
);
export const removeFromCart = createAction(
  '[Cart Page] Remove From Cart',
  props<{ productId: string }>(),
);
export const checkout = createAction(
  '[Cart Page] Checkout',
  props<{ deliveryAddress: AddressRequest }>(),
);
export const checkoutSuccess = createAction('[Cart API] Checkout Success');
export const checkoutFailure = createAction(
  '[Cart API] Checkout Failure',
  props<{ error: string }>(),
);
export const cartHydrated = createAction(
  '[Cart Storage] Cart Hydrated',
  props<{ ownerKey: string; items: CartItem[]; revision: number }>(),
);
export const cartPersisted = createAction(
  '[Cart Storage] Cart Persisted',
  props<{ revision: number }>(),
);
export const cartSyncedFromAnotherTab = createAction(
  '[Cart Storage] Cart Synced From Another Tab',
  props<{ items: CartItem[]; revision: number }>(),
);
