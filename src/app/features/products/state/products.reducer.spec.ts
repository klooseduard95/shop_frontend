import { createMockProduct } from '../../../mocks/products.mock';
import {
  createProduct,
  createProductFailure,
  createProductSuccess,
  deleteProduct,
  deleteProductFailure,
  deleteProductSuccess,
  loadProduct,
  loadProductFailure,
  loadProducts,
  loadProductsFailure,
  loadProductsSuccess,
  loadProductSuccess,
  resetProductSaveState,
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './products.actions';
import {
  productsReducer,
  ProductsState,
  selectAllProducts,
  selectProductSaveError,
  selectProductSaving,
  selectProductsLoading,
  selectSelectedProduct,
} from './products.reducer';

describe('productsReducer', () => {
  const product = createMockProduct();
  const otherProduct = createMockProduct({
    id: 'product-2',
    name: 'Other product',
  });
  const updatedProduct = createMockProduct({
    name: 'Updated product',
  });

  const request = {
    name: product.name,
    price: product.price,
    weight: product.weight,
    categoryId: product.categoryId,
  };

  it('should return the initial state for an unknown action', () => {
    expect(productsReducer(undefined, { type: 'Unknown' })).toEqual({
      items: [],
      selectedProduct: null,
      loading: false,
      error: null,
      saving: false,
      saveError: null,
    });
  });

  it('should track product list loading and success', () => {
    const loading = productsReducer(undefined, loadProducts());

    const loaded = productsReducer(
      loading,
      loadProductsSuccess({
        products: [product, otherProduct],
      }),
    );

    expect(loading).toMatchObject({
      loading: true,
      error: null,
    });

    expect(loaded).toMatchObject({
      items: [product, otherProduct],
      loading: false,
    });
  });

  it('should expose product list loading errors', () => {
    const loading = productsReducer(undefined, loadProducts());

    const failed = productsReducer(
      loading,
      loadProductsFailure({
        error: 'Load failed',
      }),
    );

    expect(failed).toMatchObject({
      loading: false,
      error: 'Load failed',
    });
  });

  it('should clear the selected product before loading details', () => {
    const selected = productsReducer(undefined, loadProductSuccess({ product }));

    const loading = productsReducer(selected, loadProduct({ id: otherProduct.id }));

    expect(loading).toMatchObject({
      selectedProduct: null,
      loading: true,
      error: null,
    });
  });

  it('should store a successfully loaded product', () => {
    const loaded = productsReducer(undefined, loadProductSuccess({ product }));

    expect(loaded).toMatchObject({
      selectedProduct: product,
      loading: false,
    });
  });

  it('should expose product detail loading errors', () => {
    const failed = productsReducer(
      undefined,
      loadProductFailure({
        error: 'Product not found',
      }),
    );

    expect(failed).toMatchObject({
      loading: false,
      error: 'Product not found',
    });
  });

  it('should track delete progress', () => {
    const deleting = productsReducer(undefined, deleteProduct({ id: product.id }));

    expect(deleting).toMatchObject({
      loading: true,
      error: null,
    });
  });

  it('should remove a deleted product and clear its selection', () => {
    let state = productsReducer(
      undefined,
      loadProductsSuccess({
        products: [product, otherProduct],
      }),
    );

    state = productsReducer(state, loadProductSuccess({ product }));

    const deleted = productsReducer(state, deleteProductSuccess({ id: product.id }));

    expect(deleted).toMatchObject({
      items: [otherProduct],
      selectedProduct: null,
      loading: false,
    });
  });

  it('should preserve another selected product after deletion', () => {
    let state = productsReducer(
      undefined,
      loadProductsSuccess({
        products: [product, otherProduct],
      }),
    );

    state = productsReducer(
      state,
      loadProductSuccess({
        product: otherProduct,
      }),
    );

    const deleted = productsReducer(state, deleteProductSuccess({ id: product.id }));

    expect(deleted.selectedProduct).toEqual(otherProduct);
  });

  it('should expose delete errors', () => {
    const failed = productsReducer(
      undefined,
      deleteProductFailure({
        error: 'Delete failed',
      }),
    );

    expect(failed).toMatchObject({
      loading: false,
      error: 'Delete failed',
    });
  });

  it.each([
    createProduct({ product: request }),
    updateProduct({
      id: product.id,
      product: request,
    }),
  ])('should track save progress', (action) => {
    const saving = productsReducer(undefined, action);

    expect(saving).toMatchObject({
      saving: true,
      saveError: null,
    });
  });

  it('should append a newly created product once', () => {
    const created = productsReducer(undefined, createProductSuccess({ product }));

    const duplicate = productsReducer(created, createProductSuccess({ product }));

    expect(created).toMatchObject({
      items: [product],
      selectedProduct: product,
      saving: false,
      saveError: null,
    });

    expect(duplicate.items).toEqual([product]);
  });

  it('should update a cached and selected product', () => {
    let state = productsReducer(
      undefined,
      loadProductsSuccess({
        products: [product, otherProduct],
      }),
    );

    state = productsReducer(state, loadProductSuccess({ product }));

    const updated = productsReducer(
      state,
      updateProductSuccess({
        product: updatedProduct,
      }),
    );

    expect(updated.items).toEqual([updatedProduct, otherProduct]);
    expect(updated.selectedProduct).toEqual(updatedProduct);
    expect(updated.saving).toBe(false);
  });

  it('should preserve a different selection after an update', () => {
    let state = productsReducer(
      undefined,
      loadProductsSuccess({
        products: [product, otherProduct],
      }),
    );

    state = productsReducer(
      state,
      loadProductSuccess({
        product: otherProduct,
      }),
    );

    const updated = productsReducer(
      state,
      updateProductSuccess({
        product: updatedProduct,
      }),
    );

    expect(updated.selectedProduct).toEqual(otherProduct);
  });

  it.each([
    createProductFailure({ error: 'Create failed' }),
    updateProductFailure({ error: 'Update failed' }),
  ])('should expose save errors', (action) => {
    const failed = productsReducer(undefined, action);

    expect(failed).toMatchObject({
      saving: false,
      saveError: action.error,
    });
  });

  it('should reset the save state', () => {
    const failed = productsReducer(
      undefined,
      createProductFailure({
        error: 'Create failed',
      }),
    );

    const reset = productsReducer(failed, resetProductSaveState());

    expect(reset).toMatchObject({
      saving: false,
      saveError: null,
    });
  });

  it('should project product state values', () => {
    const state: ProductsState = {
      items: [product],
      selectedProduct: product,
      loading: true,
      error: null,
      saving: true,
      saveError: 'Save failed',
    };

    expect(selectAllProducts.projector(state)).toEqual([product]);
    expect(selectSelectedProduct.projector(state)).toEqual(product);
    expect(selectProductsLoading.projector(state)).toBe(true);
    expect(selectProductSaving.projector(state)).toBe(true);
    expect(selectProductSaveError.projector(state)).toBe('Save failed');
  });
});
