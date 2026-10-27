import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ProductsForm } from './products-form';
import {
  createProduct,
  loadProduct,
  resetProductSaveState,
  updateProduct,
} from '../../../../shared/state/app.actions';
import {
  selectProductSaveError,
  selectProductSaving,
  selectSelectedProduct,
} from '../../../../shared/state/app.reducers';
import { createMockProduct } from '../../../../../mocks/products.mock';

describe('ProductsForm', () => {
  let component: ProductsForm;
  let fixture: ComponentFixture<ProductsForm>;
  let store: MockStore;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let routeId: string | null;

  const product = createMockProduct({ id: 'product-1', name: 'Loaded product' });

  async function configure(): Promise<void> {
    router = { navigate: vi.fn().mockResolvedValue(true) };
    await TestBed.configureTestingModule({
      imports: [ProductsForm],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } },
        },
        { provide: Router, useValue: router },
        provideMockStore({
          selectors: [
            { selector: selectSelectedProduct, value: null },
            { selector: selectProductSaving, value: false },
            { selector: selectProductSaveError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ProductsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('create mode', () => {
    beforeEach(async () => {
      routeId = null;
      await configure();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(store.dispatch).toHaveBeenCalledWith(resetProductSaveState());
    });

    it('should dispatch a create action for a valid form', () => {
      component.productForm.setValue({
        name: 'New product',
        price: 10,
        weight: 2,
        categoryId: 'category-1',
      });

      component.handleSave();

      expect(store.dispatch).toHaveBeenCalledWith(
        createProduct({
          product: {
            name: 'New product',
            price: 10,
            weight: 2,
            categoryId: 'category-1',
          },
        }),
      );
    });

    it('should not dispatch a save for an invalid form', () => {
      component.productForm.controls.name.setValue('');

      component.handleSave();

      expect(store.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: createProduct.type }),
      );
      expect(store.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: updateProduct.type }),
      );
      expect(component.productForm.controls.name.touched).toBe(true);
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      routeId = product.id;
      await configure();
    });

    it('should load and hydrate the matching product', async () => {
      expect(store.dispatch).toHaveBeenCalledWith(loadProduct({ id: product.id }));

      store.overrideSelector(selectSelectedProduct, product);
      store.refreshState();
      await fixture.whenStable();

      expect(component.productForm.getRawValue()).toEqual({
        name: product.name,
        price: product.price,
        weight: product.weight,
        categoryId: product.categoryId,
      });
    });

    it('should ignore a selected product for a different route', async () => {
      const originalValue = component.productForm.getRawValue();
      store.overrideSelector(selectSelectedProduct, createMockProduct({ id: 'different-product' }));
      store.refreshState();
      await fixture.whenStable();

      expect(component.productForm.getRawValue()).toEqual(originalValue);
    });

    it('should dispatch an update action', () => {
      component.productForm.setValue({
        name: 'Updated product',
        price: 20,
        weight: 3,
        categoryId: 'category-2',
      });

      component.handleSave();

      expect(store.dispatch).toHaveBeenCalledWith(
        updateProduct({
          id: product.id,
          product: {
            name: 'Updated product',
            price: 20,
            weight: 3,
            categoryId: 'category-2',
          },
        }),
      );
    });
  });

  it('should navigate directly when cancelled', async () => {
    routeId = null;
    await configure();

    await component.handleCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
