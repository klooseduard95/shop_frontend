import { createAction, props } from '@ngrx/store';
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
