import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsListView } from './products-list-view';

describe('ProductsListView', () => {
  let component: ProductsListView;
  let fixture: ComponentFixture<ProductsListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListView],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
