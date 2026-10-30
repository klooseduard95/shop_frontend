import { createAction, props } from '@ngrx/store';
import { Product, ProductRequest } from '../types/products.types';

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
