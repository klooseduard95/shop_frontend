import { createAction, props } from '@ngrx/store';
import { Product, ProductRequest } from '../../products/types/products.types';
import { LoginRequest, UserProfile } from '../types/users.types';
import { AddressRequest } from '../../shopping-cart/types/order.types';

export const loadProducts = createAction('[Products Page] Load Products');
export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>(),
);
export const loadProductsFailure = createAction(
  '[Products API] Load Products Failure',
  props<{ error: string }>(),
);
export const loadProduct = createAction('[Product Details] Load Product', props<{ id: string }>());
export const loadProductSuccess = createAction(
  '[Products API] Load Product Success',
  props<{ product: Product }>(),
);
export const loadProductFailure = createAction(
  '[Products API] Load Product Failure',
  props<{ error: string }>(),
);
export const deleteProduct = createAction(
  '[Product Details] Delete Product',
  props<{ id: string }>(),
);
export const deleteProductSuccess = createAction(
  '[Products API] Delete Product Success',
  props<{ id: string }>(),
);
export const deleteProductFailure = createAction(
  '[Products API] Delete Product Failure',
  props<{ error: string }>(),
);
export const createProduct = createAction(
  '[Product Form] Create Product',
  props<{ product: ProductRequest }>(),
);
export const createProductSuccess = createAction(
  '[Products API] Create Product Success',
  props<{ product: Product }>(),
);
export const createProductFailure = createAction(
  '[Products API] Create Product Failure',
  props<{ error: string }>(),
);
export const updateProduct = createAction(
  '[Product Form] Update Product',
  props<{ id: string; product: ProductRequest }>(),
);
export const updateProductSuccess = createAction(
  '[Products API] Update Product Success',
  props<{ product: Product }>(),
);
export const updateProductFailure = createAction(
  '[Products API] Update Product Failure',
  props<{ error: string }>(),
);
export const resetProductSaveState = createAction('[Product Form] Reset Save State');
export const login = createAction('[Auth Page] Login', props<{ credentials: LoginRequest }>());
export const restoreSession = createAction('[Auth] Restore Session', props<{ token: string }>());
export const authInitialized = createAction('[Auth] Initialized Without Session');
export const restoreSessionSuccess = createAction(
  '[Auth API] Restore Session Success',
  props<{ user: UserProfile }>(),
);
export const restoreSessionFailure = createAction(
  '[Auth API] Restore Session Failure',
  props<{ error: string }>(),
);
export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ user: UserProfile; token: string }>(),
);
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: string }>());
export const logout = createAction('[Auth Page] Logout');

export const addToCart = createAction(
  '[Products Details] Add To Cart',
  props<{ product: Product }>(),
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
