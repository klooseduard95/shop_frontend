import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsList } from './products-list';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { deleteProduct, loadProducts } from '../../../state/products.actions';
import { createMockProduct } from '../../../../../mocks/products.mock';

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
            products: { items: [], selectedProduct: null, loading: false, error: null },
            auth: {
              user: null,
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
});
