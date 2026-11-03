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
  initialProductsState,
  productsAdapter,
  productsReducer,
  ProductsState,
} from './products.reducer';
import {
  selectAllProducts,
  selectProductById,
  selectProductEntities,
  selectProductIds,
  selectProductSaveError,
  selectProductSaving,
  selectProductsError,
  selectProductsLoading,
  selectProductsTotal,
  selectSelectedProduct,
  selectSelectedProductId,
} from './products.selectors';

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
      ids: [],
      entities: {},
      selectedProductId: null,
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

    expect(loaded.ids).toEqual([product.id, otherProduct.id]);
    expect(loaded.entities).toEqual({
      [product.id]: product,
      [otherProduct.id]: otherProduct,
    });
    expect(loaded.loading).toBe(false);
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
      selectedProductId: null,
      loading: true,
      error: null,
    });
  });

  it('should store a successfully loaded product', () => {
    const loaded = productsReducer(undefined, loadProductSuccess({ product }));

    expect(loaded).toMatchObject({
      selectedProductId: product.id,
      loading: false,
    });
    expect(loaded.entities[product.id]).toEqual(product);
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

    expect(deleted.ids).toEqual([otherProduct.id]);
    expect(deleted.entities).toEqual({ [otherProduct.id]: otherProduct });
    expect(deleted.selectedProductId).toBeNull();
    expect(deleted.loading).toBe(false);
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

    expect(deleted.selectedProductId).toBe(otherProduct.id);
    expect(deleted.entities[otherProduct.id]).toEqual(otherProduct);
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

    expect(created.ids).toEqual([product.id]);
    expect(created.entities[product.id]).toEqual(product);
    expect(created.selectedProductId).toBe(product.id);
    expect(created.saving).toBe(false);
    expect(created.saveError).toBeNull();
    expect(duplicate.ids).toEqual([product.id]);
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

    expect(updated.ids).toEqual([updatedProduct.id, otherProduct.id]);
    expect(updated.entities[updatedProduct.id]).toEqual(updatedProduct);
    expect(updated.selectedProductId).toBe(updatedProduct.id);
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

    expect(updated.selectedProductId).toBe(otherProduct.id);
    expect(updated.entities[otherProduct.id]).toEqual(otherProduct);
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
    const state: ProductsState = productsAdapter.setOne(product, {
      ...initialProductsState,
      selectedProductId: product.id,
      loading: true,
      saving: true,
      saveError: 'Save failed',
    });

    expect(selectAllProducts.projector(state)).toEqual([product]);
    expect(selectSelectedProduct.projector(state.entities, state.selectedProductId)).toEqual(
      product,
    );
    expect(selectProductsLoading.projector(state)).toBe(true);
    expect(selectProductSaving.projector(state)).toBe(true);
    expect(selectProductSaveError.projector(state)).toBe('Save failed');
  });

  it('should project normalized product entities and product lookup fallbacks', () => {
    const state: ProductsState = productsAdapter.setAll([product, otherProduct], {
      ...initialProductsState,
      selectedProductId: product.id,
      error: 'Products unavailable',
    });

    expect(selectProductIds.projector(state)).toEqual([product.id, otherProduct.id]);
    expect(selectProductEntities.projector(state)).toEqual({
      [product.id]: product,
      [otherProduct.id]: otherProduct,
    });
    expect(selectProductsTotal.projector(state)).toBe(2);
    expect(selectSelectedProductId.projector(state)).toBe(product.id);
    expect(selectProductsError.projector(state)).toBe('Products unavailable');

    expect(selectSelectedProduct.projector(state.entities, null)).toBeNull();
    expect(selectSelectedProduct.projector(state.entities, 'missing-product')).toBeNull();

    expect(selectProductById(product.id).projector(state.entities)).toEqual(product);
    expect(selectProductById('missing-product').projector(state.entities)).toBeNull();
  });
});
