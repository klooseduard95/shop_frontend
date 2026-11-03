import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
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

export interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

const initialProductsState: ProductsState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

export const productsReducer = createReducer(
  initialProductsState,
  on(loadProducts, (state) => ({ ...state, loading: true, error: null })),
  on(loadProductsSuccess, (state, { products }) => ({ ...state, items: products, loading: false })),
  on(loadProductsFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(loadProduct, (state) => ({
    ...state,
    selectedProduct: null,
    loading: true,
    error: null,
  })),
  on(loadProductSuccess, (state, { product }) => ({
    ...state,
    selectedProduct: product,
    loading: false,
  })),
  on(loadProductFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(deleteProduct, (state) => ({ ...state, loading: true, error: null })),
  on(deleteProductSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((product) => product.id !== id),
    selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
    loading: false,
  })),
  on(deleteProductFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(createProduct, updateProduct, (state) => ({
    ...state,
    saving: true,
    saveError: null,
  })),
  on(createProductSuccess, (state, { product }) => ({
    ...state,
    items: state.items.some(({ id }) => id === product.id)
      ? state.items
      : [...state.items, product],
    selectedProduct: product,
    saving: false,
    saveError: null,
  })),
  on(updateProductSuccess, (state, { product }) => ({
    ...state,
    items: state.items.map((item) => (item.id === product.id ? product : item)),
    selectedProduct: state.selectedProduct?.id === product.id ? product : state.selectedProduct,
    saving: false,
    saveError: null,
  })),
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

export const selectProductsState = createFeatureSelector<ProductsState>('products');
export const selectAllProducts = createSelector(selectProductsState, (state) => state.items);
export const selectSelectedProduct = createSelector(
  selectProductsState,
  (state) => state.selectedProduct,
);
export const selectProductsLoading = createSelector(selectProductsState, (state) => state.loading);
export const selectProductSaving = createSelector(selectProductsState, (state) => state.saving);
export const selectProductSaveError = createSelector(
  selectProductsState,
  (state) => state.saveError,
);
