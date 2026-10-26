import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsDetailsView } from './products-details-view';

describe('ProductsDetailsView', () => {
  let component: ProductsDetailsView;
  let fixture: ComponentFixture<ProductsDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsDetailsView],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
