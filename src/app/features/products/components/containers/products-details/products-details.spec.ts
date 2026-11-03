import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { ProductsDetails } from './products-details';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectSelectedProduct } from '../../../state/products.selectors';
import { selectIsAdmin } from '../../../../auth/state/auth.selectors';
import { Store } from '@ngrx/store';
import { deleteProduct, loadProduct } from '../../../state/products.actions';
import { addToCart } from '../../../../shopping-cart/state/cart.actions';
import { ProductsDetailsView } from '../../presentational/products-details-view/products-details-view';
import { By } from '@angular/platform-browser';

describe('ProductsDetails', () => {
  let component: ProductsDetails;
  let fixture: ComponentFixture<ProductsDetails>;
  let store: MockStore;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const mockProduct = createMockProduct({ id: 'product-1' });

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ id: mockProduct.id }));

    await TestBed.configureTestingModule({
      imports: [ProductsDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: routeParams.asObservable() },
        },
        provideMockStore({
          selectors: [
            { selector: selectSelectedProduct, value: mockProduct },
            { selector: selectIsAdmin, value: false },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store) as MockStore;
    vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ProductsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the product matching the initial route id', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProduct({ id: mockProduct.id }));
    expect(component.product()).toEqual(mockProduct);
  });

  it('should load another product when the route id changes', async () => {
    routeParams.next(convertToParamMap({ id: 'product-2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.dispatch).toHaveBeenCalledWith(loadProduct({ id: 'product-2' }));
  });

  it('should render the loading placeholder until a product is available', () => {
    store.overrideSelector(selectSelectedProduct, null);
    store.refreshState();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Select a product from the list to view details.',
    );
  });

  it('should add the selected product to the cart', () => {
    component.handleAddToCart(mockProduct);

    expect(store.dispatch).toHaveBeenCalledWith(addToCart({ productId: mockProduct.id }));
  });

  it('should dispatch deletion after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.handleDelete(mockProduct.id);

    expect(store.dispatch).toHaveBeenCalledWith(deleteProduct({ id: mockProduct.id }));
  });

  it('should not dispatch deletion when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.handleDelete(mockProduct.id);

    expect(store.dispatch).not.toHaveBeenCalledWith(deleteProduct({ id: mockProduct.id }));
  });

  it('should handle add-to-cart events emitted by the view', () => {
    const view = fixture.debugElement.query(By.directive(ProductsDetailsView))
      .componentInstance as ProductsDetailsView;

    view.addToCart.emit(mockProduct);

    expect(store.dispatch).toHaveBeenCalledWith(
      addToCart({
        productId: mockProduct.id,
      }),
    );
  });

  it('should handle delete events emitted by the view', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const view = fixture.debugElement.query(By.directive(ProductsDetailsView))
      .componentInstance as ProductsDetailsView;

    view.deleteProduct.emit(mockProduct.id);

    expect(store.dispatch).toHaveBeenCalledWith(
      deleteProduct({
        id: mockProduct.id,
      }),
    );
  });

  it('should not load a product before a route id is available', async () => {
    fixture.destroy();
    TestBed.resetTestingModule();

    const params = new Subject<ReturnType<typeof convertToParamMap>>();

    await TestBed.configureTestingModule({
      imports: [ProductsDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: params.asObservable(),
          },
        },
        provideMockStore({
          selectors: [
            {
              selector: selectSelectedProduct,
              value: null,
            },
            {
              selector: selectIsAdmin,
              value: false,
            },
          ],
        }),
      ],
    }).compileComponents();

    const localStore = TestBed.inject(MockStore);
    vi.spyOn(localStore, 'dispatch');

    const localFixture = TestBed.createComponent(ProductsDetails);

    localFixture.detectChanges();
    await localFixture.whenStable();

    expect(localStore.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: loadProduct.type,
      }),
    );

    localFixture.destroy();
  });
});
