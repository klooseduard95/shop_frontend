import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsList } from './products-list';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { deleteProduct, loadProducts } from '../../../state/products.actions';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { selectProductsLoading } from '../../../state/products.selectors';
import { By } from '@angular/platform-browser';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';

describe('ProductsList', () => {
  let component: ProductsList;
  let fixture: ComponentFixture<ProductsList>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsList],
      providers: [
        provideMockStore({
          initialState: {
            products: {
              ids: [],
              entities: {},
              selectedProductId: null,
              loading: false,
              error: null,
              saving: false,
              saveError: null,
            },
            auth: {
              ids: [],
              entities: {},
              currentUserId: null,
              token: null,
              initialized: true,
              loading: false,
              error: null,
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsList);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as MockStore;
    vi.spyOn(store, 'dispatch');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products when initialized', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
  });

  it('should delete after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const product = createMockProduct();

    component.handleDelete(product.id);

    expect(store.dispatch).toHaveBeenCalledWith(deleteProduct({ id: product.id }));
  });

  it('should not delete without confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.handleDelete('product-1');

    expect(store.dispatch).not.toHaveBeenCalledWith(deleteProduct({ id: 'product-1' }));
  });

  it('should render the loading message while products are loading', () => {
    store.overrideSelector(selectProductsLoading, true);
    store.refreshState();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading products...');
  });

  it('should handle deletion emitted by the products view', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const product = createMockProduct();

    const view = fixture.debugElement.query(By.directive(ProductsListView))
      .componentInstance as ProductsListView;

    view.deleteProduct.emit(product.id);

    expect(store.dispatch).toHaveBeenCalledWith(
      deleteProduct({
        id: product.id,
      }),
    );
  });
});
