import { createReducer, on } from '@ngrx/store';
import { Product } from '../types/products.types';
import {
  createProduct,
  createProductFailure,
  createProductSuccess,
  deleteProduct,
  deleteProductFailure,
  deleteProductSuccess,
  loadProduct,
  loadProductFailure,
  loadProductSuccess,
  loadProducts,
  loadProductsFailure,
  loadProductsSuccess,
  resetProductSaveState,
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './products.actions';
import { createEntityAdapter, EntityState } from '@ngrx/entity';

export const productsFeatureKey = 'products';

export interface ProductsState extends EntityState<Product> {
  selectedProductId: string | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

export const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product.id,
});

export const initialProductsState: ProductsState = productsAdapter.getInitialState({
  selectedProductId: null,
  loading: false,
  error: null,
  saving: false,
  saveError: null,
});

export const productsReducer = createReducer(
  initialProductsState,
  on(loadProducts, (state) => ({ ...state, loading: true, error: null })),
  on(loadProductsSuccess, (state, { products }) =>
    productsAdapter.setAll(products, {
      ...state,
      loading: false,
      error: null,
    }),
  ),
  on(loadProductsFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(loadProduct, (state) => ({
    ...state,
    selectedProductId: null,
    loading: true,
    error: null,
  })),
  on(loadProductSuccess, (state, { product }) =>
    productsAdapter.upsertOne(product, {
      ...state,
      selectedProductId: product.id,
      loading: false,
      error: null,
    }),
  ),
  on(loadProductFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(deleteProduct, (state) => ({ ...state, loading: true, error: null })),
  on(deleteProductSuccess, (state, { id }) =>
    productsAdapter.removeOne(id, {
      ...state,
      selectedProductId: state.selectedProductId === id ? null : state.selectedProductId,
      loading: false,
      error: null,
    }),
  ),
  on(deleteProductFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(createProduct, updateProduct, (state) => ({
    ...state,
    saving: true,
    saveError: null,
  })),
  on(createProductSuccess, (state, { product }) =>
    productsAdapter.addOne(product, {
      ...state,
      selectedProductId: product.id,
      saving: false,
      saveError: null,
    }),
  ),
  on(updateProductSuccess, (state, { product }) =>
    productsAdapter.upsertOne(product, {
      ...state,
      saving: false,
      saveError: null,
    }),
  ),
  on(createProductFailure, updateProductFailure, (state, { error }) => ({
    ...state,
    saving: false,
    saveError: error,
  })),
  on(resetProductSaveState, (state) => ({
    ...state,
    saving: false,
    saveError: null,
  })),
);
