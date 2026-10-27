import { AuthState, CartState, ProductsState } from '../../../app.state';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
  addToCart,
  checkout,
  checkoutFailure,
  checkoutSuccess,
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
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  removeFromCart,
  resetProductSaveState,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './app.actions';

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

const initialAuthState: AuthState = {
  user: null,
  token: null,
  initialized: false,
  loading: false,
  error: null,
};
export const authReducer = createReducer(
  initialAuthState,
  on(restoreSession, (state, { token }) => ({
    ...state,
    token,
    initialized: false,
    loading: true,
    error: null,
  })),
  on(authInitialized, (state) => ({ ...state, initialized: true, loading: false })),
  on(restoreSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    initialized: true,
    loading: false,
    error: null,
  })),
  on(restoreSessionFailure, (_state, { error }) => ({
    ...initialAuthState,
    initialized: true,
    error,
  })),
  on(login, (state) => ({ ...state, loading: true, error: null })),
  on(loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    initialized: true,
    loading: false,
    error: null,
  })),
  on(loginFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(logout, () => ({ ...initialAuthState, initialized: true })),
);

const initialCartState: CartState = { items: [], loading: false, error: null };
export const cartReducer = createReducer(
  initialCartState,
  on(addToCart, (state, { product }) => {
    const exists = state.items.some((i) => i.product.id === product.id);
    const updatedItems = exists
      ? state.items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      : [...state.items, { product, quantity: 1 }];
    return { ...state, items: updatedItems };
  }),
  on(removeFromCart, (state, { productId }) => ({
    ...state,
    items: state.items.filter((i) => i.product.id !== productId),
  })),
  on(checkout, (state) => ({ ...state, loading: true, error: null })),
  on(checkoutSuccess, (state) => ({ ...state, items: [], loading: false, error: null })),
  on(checkoutFailure, (state, { error }) => ({ ...state, loading: false, error })),
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

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);
export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);
export const selectAuthInitialized = createSelector(selectAuthState, (state) => state.initialized);
export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  ({ user, token, initialized }) => initialized && user !== null && token !== null,
);
export const selectIsAdmin = createSelector(selectCurrentUser, (user) => user?.role === 'ADMIN');
export const selectIsCustomer = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'CUSTOMER',
);

export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectCartItems = createSelector(selectCartState, (state) => state.items);
export const selectCartError = createSelector(selectCartState, (state) => state.error);
export const selectCartTotal = createSelector(selectCartState, (state) =>
  state.items.reduce((total, item) => total + item.product.price * item.quantity, 0),
);
