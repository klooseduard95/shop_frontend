import { createFeatureSelector, createSelector } from '@ngrx/store';
import { productsAdapter, productsFeatureKey, ProductsState } from './products.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>(productsFeatureKey);

const productEntitySelectors = productsAdapter.getSelectors();

export const selectProductIds = createSelector(
  selectProductsState,
  productEntitySelectors.selectIds,
);

export const selectProductEntities = createSelector(
  selectProductsState,
  productEntitySelectors.selectEntities,
);

export const selectAllProducts = createSelector(
  selectProductsState,
  productEntitySelectors.selectAll,
);

export const selectProductsTotal = createSelector(
  selectProductsState,
  productEntitySelectors.selectTotal,
);

export const selectSelectedProductId = createSelector(
  selectProductsState,
  (state) => state.selectedProductId,
);

export const selectSelectedProduct = createSelector(
  selectProductEntities,
  selectSelectedProductId,
  (entities, selectedProductId) =>
    selectedProductId === null ? null : (entities[selectedProductId] ?? null),
);

export const selectProductById = (id: string) =>
  createSelector(selectProductEntities, (entities) => entities[id] ?? null);

export const selectProductsLoading = createSelector(selectProductsState, (state) => state.loading);

export const selectProductsError = createSelector(selectProductsState, (state) => state.error);

export const selectProductSaving = createSelector(selectProductsState, (state) => state.saving);

export const selectProductSaveError = createSelector(
  selectProductsState,
  (state) => state.saveError,
);
