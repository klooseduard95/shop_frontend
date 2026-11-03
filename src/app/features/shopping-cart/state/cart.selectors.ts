import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartItemDetails } from '../types/cart.types';
import { selectProductEntities } from '../../products/state/products.selectors';
import { cartAdapter, cartFeatureKey, CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>(cartFeatureKey);

const cartEntitySelectors = cartAdapter.getSelectors();

export const selectCartItemIds = createSelector(selectCartState, cartEntitySelectors.selectIds);

export const selectCartItemEntities = createSelector(
  selectCartState,
  cartEntitySelectors.selectEntities,
);

export const selectCartItems = createSelector(selectCartState, cartEntitySelectors.selectAll);

export const selectCartItemCount = createSelector(selectCartState, cartEntitySelectors.selectTotal);

export const selectCartError = createSelector(selectCartState, (state) => state.error);

export const selectCartLoading = createSelector(selectCartState, (state) => state.loading);

export const selectCartOwnerKey = createSelector(selectCartState, (state) => state.ownerKey);

export const selectCartRevision = createSelector(selectCartState, (state) => state.revision);

export const selectCartItemDetails = createSelector(
  selectCartItems,
  selectProductEntities,
  (items, productEntities) =>
    items.reduce<CartItemDetails[]>((details, item) => {
      const product = productEntities[item.productId];

      return product ? [...details, { ...item, product }] : details;
    }, []),
);

export const selectCartTotal = createSelector(selectCartItemDetails, (items) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0),
);
