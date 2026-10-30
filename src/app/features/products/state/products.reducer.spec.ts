import { createMockProduct } from '../../../mocks/products.mock';
import {
  createProduct,
  createProductFailure,
  createProductSuccess,
  updateProduct,
  updateProductSuccess,
} from './products.actions';
import { productsReducer } from './products.reducer';

describe('productsReducer', () => {
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
