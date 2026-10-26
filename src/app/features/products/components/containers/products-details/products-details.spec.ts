import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsDetails } from './products-details';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { vi } from 'vitest';

describe('ProductsDetails', () => {
  let component: ProductsDetails;
  let fixture: ComponentFixture<ProductsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it("should have a null product when initialized", () => {
    expect(component.product).toBeNull();
  });

  it("should log the product when handleAddToCart is called", () => {
    vi.spyOn(console, 'log');
    const mockProduct = createMockProduct({ name: "Test Product" });

    component.handleAddToCart(mockProduct);
    expect(console.log).toHaveBeenCalledWith("Product added to cart:", mockProduct);
  });
});
