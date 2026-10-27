import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsList } from './products-list';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProductsList', () => {
  let component: ProductsList;
  let fixture: ComponentFixture<ProductsList>;

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
