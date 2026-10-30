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
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './products.actions';
import { ProductsEffects } from './products.effects';

describe('ProductsEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: ProductsEffects;
  let productsService: {
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

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
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        ProductsEffects,
        provideMockActions(() => actions$),
        { provide: ProductsService, useValue: productsService },
        { provide: Router, useValue: router },
      ],
    });

    effects = TestBed.inject(ProductsEffects);
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

    await expect(result).resolves.toEqual(createProductFailure({ error: 'Create failed' }));
  });

  it('should update a product', async () => {
    productsService.updateProduct.mockReturnValue(of(product));
    const result = firstValueFrom(effects.updateProduct$);

    actions$.next(updateProduct({ id: product.id, product: request }));

    await expect(result).resolves.toEqual(updateProductSuccess({ product }));
    expect(productsService.updateProduct).toHaveBeenCalledWith(product.id, request);
  });

  it('should report update failures', async () => {
    productsService.updateProduct.mockReturnValue(throwError(() => new Error('Update failed')));
    const result = firstValueFrom(effects.updateProduct$);

    actions$.next(updateProduct({ id: product.id, product: request }));

    await expect(result).resolves.toEqual(updateProductFailure({ error: 'Update failed' }));
  });

  it('should navigate after a successful save', async () => {
    const result = firstValueFrom(effects.navigateAfterSave$);

    actions$.next(createProductSuccess({ product }));
    await result;

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
