import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProductsDetails } from './products-details';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { selectIsAdmin, selectSelectedProduct } from '../../../../shared/state/app.reducers';
import { Store } from '@ngrx/store';
import { addToCart, deleteProduct, loadProduct } from '../../../../shared/state/app.actions';

describe('ProductsDetails', () => {
  let component: ProductsDetails;
  let fixture: ComponentFixture<ProductsDetails>;
  let store: Store;
  const mockProduct = createMockProduct();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsDetails],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        provideMockStore({
          selectors: [
            { selector: selectSelectedProduct, value: mockProduct },
            { selector: selectIsAdmin, value: false },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ProductsDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the product id from the route', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProduct({ id: '1' }));
    expect(component.product()).toEqual(mockProduct);
  });

  it('should add the product to the cart when requested', () => {
    component.handleAddToCart(mockProduct);
    expect(store.dispatch).toHaveBeenCalledWith(addToCart({ product: mockProduct }));
  });

  it('should delete the product after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.handleDelete(mockProduct.id);

    expect(store.dispatch).toHaveBeenCalledWith(deleteProduct({ id: mockProduct.id }));
  });
});
