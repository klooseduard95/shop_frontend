import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';
import { createMockProduct } from '../../../mocks/products.mock';
import { ProductsService } from '../services/products.service';
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
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './products.actions';
import { ProductsEffects } from './products.effects';

describe('ProductsEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: ProductsEffects;

  let productsService: {
    getProducts: ReturnType<typeof vi.fn>;
    getProductById: ReturnType<typeof vi.fn>;
    deleteProduct: ReturnType<typeof vi.fn>;
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const product = createMockProduct();

  const request = {
    name: product.name,
    price: product.price,
    weight: product.weight,
    categoryId: product.categoryId,
  };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    productsService = {
      getProducts: vi.fn(),
      getProductById: vi.fn(),
      deleteProduct: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
    };

    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        ProductsEffects,
        provideMockActions(() => actions$),
        {
          provide: ProductsService,
          useValue: productsService,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    });

    effects = TestBed.inject(ProductsEffects);
  });

  it('should load all products', async () => {
    productsService.getProducts.mockReturnValue(of([product]));

    const result = firstValueFrom(effects.loadProducts$);

    actions$.next(loadProducts());

    await expect(result).resolves.toEqual(loadProductsSuccess({ products: [product] }));
    expect(productsService.getProducts).toHaveBeenCalled();
  });

  it('should report product list loading failures', async () => {
    productsService.getProducts.mockReturnValue(
      throwError(() => new Error('Products unavailable')),
    );

    const result = firstValueFrom(effects.loadProducts$);

    actions$.next(loadProducts());

    await expect(result).resolves.toEqual(
      loadProductsFailure({
        error: 'Products unavailable',
      }),
    );
  });

  it('should load one product', async () => {
    productsService.getProductById.mockReturnValue(of(product));

    const result = firstValueFrom(effects.loadProduct$);

    actions$.next(loadProduct({ id: product.id }));

    await expect(result).resolves.toEqual(loadProductSuccess({ product }));
    expect(productsService.getProductById).toHaveBeenCalledWith(product.id);
  });

  it('should report product loading failures', async () => {
    productsService.getProductById.mockReturnValue(
      throwError(() => new Error('Product unavailable')),
    );

    const result = firstValueFrom(effects.loadProduct$);

    actions$.next(loadProduct({ id: product.id }));

    await expect(result).resolves.toEqual(
      loadProductFailure({
        error: 'Product unavailable',
      }),
    );
  });

  it('should delete a product', async () => {
    productsService.deleteProduct.mockReturnValue(of(undefined));

    const result = firstValueFrom(effects.deleteProduct$);

    actions$.next(deleteProduct({ id: product.id }));

    await expect(result).resolves.toEqual(deleteProductSuccess({ id: product.id }));
    expect(productsService.deleteProduct).toHaveBeenCalledWith(product.id);
  });

  it('should report delete failures', async () => {
    productsService.deleteProduct.mockReturnValue(throwError(() => new Error('Delete failed')));

    const result = firstValueFrom(effects.deleteProduct$);

    actions$.next(deleteProduct({ id: product.id }));

    await expect(result).resolves.toEqual(
      deleteProductFailure({
        error: 'Delete failed',
      }),
    );
  });

  it('should create a product', async () => {
    productsService.createProduct.mockReturnValue(of(product));

    const result = firstValueFrom(effects.createProduct$);

    actions$.next(createProduct({ product: request }));

    await expect(result).resolves.toEqual(createProductSuccess({ product }));
    expect(productsService.createProduct).toHaveBeenCalledWith(request);
  });

  it('should report create failures', async () => {
    productsService.createProduct.mockReturnValue(throwError(() => new Error('Create failed')));

    const result = firstValueFrom(effects.createProduct$);

    actions$.next(createProduct({ product: request }));

    await expect(result).resolves.toEqual(
      createProductFailure({
        error: 'Create failed',
      }),
    );
  });

  it('should update a product', async () => {
    productsService.updateProduct.mockReturnValue(of(product));

    const result = firstValueFrom(effects.updateProduct$);

    actions$.next(
      updateProduct({
        id: product.id,
        product: request,
      }),
    );

    await expect(result).resolves.toEqual(updateProductSuccess({ product }));
    expect(productsService.updateProduct).toHaveBeenCalledWith(product.id, request);
  });

  it('should report update failures', async () => {
    productsService.updateProduct.mockReturnValue(throwError(() => new Error('Update failed')));

    const result = firstValueFrom(effects.updateProduct$);

    actions$.next(
      updateProduct({
        id: product.id,
        product: request,
      }),
    );

    await expect(result).resolves.toEqual(
      updateProductFailure({
        error: 'Update failed',
      }),
    );
  });

  it.each([createProductSuccess({ product }), updateProductSuccess({ product })])(
    'should navigate after a successful save',
    async (action) => {
      const result = firstValueFrom(effects.navigateAfterSave$);

      actions$.next(action);

      await result;

      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    },
  );

  it('should navigate after successful deletion', async () => {
    const result = firstValueFrom(effects.navigateAfterDelete$);

    actions$.next(deleteProductSuccess({ id: product.id }));

    await result;

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
