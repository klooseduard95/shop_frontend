import {
  authInitialized,
  createProduct,
  createProductFailure,
  createProductSuccess,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
  updateProduct,
  updateProductSuccess,
} from './app.actions';
import {
  authReducer,
  productsReducer,
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsCustomer,
} from './app.reducers';
import { createMockProduct } from '../../../mocks/products.mock';

describe('productsReducer saves', () => {
  const product = createMockProduct();
  const updatedProduct = createMockProduct({ name: 'Updated product' });
  const request = {
    name: product.name,
    price: product.price,
    weight: product.weight,
    categoryId: product.categoryId,
  };

  it('should track create progress and append the returned product once', () => {
    const saving = productsReducer(undefined, createProduct({ product: request }));
    const created = productsReducer(saving, createProductSuccess({ product }));
    const duplicate = productsReducer(created, createProductSuccess({ product }));

    expect(saving).toMatchObject({ saving: true, saveError: null });
    expect(created).toMatchObject({
      items: [product],
      selectedProduct: product,
      saving: false,
      saveError: null,
    });
    expect(duplicate.items).toEqual([product]);
  });

  it('should replace an updated cached and selected product', () => {
    const created = productsReducer(undefined, createProductSuccess({ product }));
    const saving = productsReducer(created, updateProduct({ id: product.id, product: request }));
    const updated = productsReducer(saving, updateProductSuccess({ product: updatedProduct }));

    expect(updated.items).toEqual([updatedProduct]);
    expect(updated.selectedProduct).toEqual(updatedProduct);
    expect(updated.saving).toBe(false);
  });

  it('should expose save errors without clearing the selected product', () => {
    const created = productsReducer(undefined, createProductSuccess({ product }));
    const failed = productsReducer(created, createProductFailure({ error: 'Save failed' }));

    expect(failed).toMatchObject({
      selectedProduct: product,
      saving: false,
      saveError: 'Save failed',
    });
  });
});

describe('authReducer', () => {
  const user = { id: '1', username: 'user', role: 'CUSTOMER' as const };

  it('should initialize without a persisted session', () => {
    const state = authReducer(undefined, authInitialized());

    expect(state).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should restore a persisted session', () => {
    const restoring = authReducer(undefined, restoreSession({ token: 'token' }));
    const restored = authReducer(restoring, restoreSessionSuccess({ user }));

    expect(restoring).toMatchObject({ token: 'token', initialized: false, loading: true });
    expect(restored).toMatchObject({
      user,
      token: 'token',
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should clear stale auth data when restoration fails', () => {
    const restoring = authReducer(undefined, restoreSession({ token: 'expired' }));
    const failed = authReducer(restoring, restoreSessionFailure({ error: 'Unauthorized' }));

    expect(failed).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: 'Unauthorized',
    });
  });

  it('should handle login success, failure, and logout', () => {
    const loading = authReducer(undefined, login({ credentials: { username: 'user' } }));
    const failed = authReducer(loading, loginFailure({ error: 'Invalid credentials' }));
    const loggedIn = authReducer(failed, loginSuccess({ user, token: 'token' }));
    const loggedOut = authReducer(loggedIn, logout());

    expect(loading.loading).toBe(true);
    expect(failed).toMatchObject({ loading: false, error: 'Invalid credentials' });
    expect(loggedIn).toMatchObject({ user, token: 'token', error: null });
    expect(loggedOut).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should derive authentication and role flags', () => {
    expect(
      selectIsAuthenticated.projector({
        user,
        token: 'token',
        initialized: true,
        loading: false,
        error: null,
      }),
    ).toBe(true);
    expect(
      selectIsAuthenticated.projector({
        user: null,
        token: 'token',
        initialized: false,
        loading: true,
        error: null,
      }),
    ).toBe(false);
    expect(selectIsAdmin.projector({ ...user, role: 'ADMIN' })).toBe(true);
    expect(selectIsCustomer.projector(user)).toBe(true);
  });
});
