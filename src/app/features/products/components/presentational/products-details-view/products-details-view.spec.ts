import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductsDetailsView } from './products-details-view';
import { createMockProduct } from '../../../../../mocks/products.mock';

describe('ProductsDetailsView', () => {
  let component: ProductsDetailsView;
  let fixture: ComponentFixture<ProductsDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsDetailsView],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product details and emit add to cart', () => {
    const product = createMockProduct({ name: 'Coffee grinder' });
    const addToCart = vi.fn();
    component.addToCart.subscribe(addToCart);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const addButton = [...element.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Add to Cart'),
    );

    expect(element.textContent).toContain('Coffee grinder');
    expect(element.textContent).toContain(`${product.price} EUR`);
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Coffee grinder');
    addButton?.click();
    expect(addToCart).toHaveBeenCalledWith(product);
  });

  it('should show administrator actions only for administrators', () => {
    const product = createMockProduct();
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();

    const deleteProduct = vi.fn();
    component.deleteProduct.subscribe(deleteProduct);
    const deleteButton = [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLButtonElement) =>
      button.textContent?.includes('Delete'),
    );

    expect(fixture.nativeElement.textContent).toContain('Edit');
    deleteButton?.click();
    expect(deleteProduct).toHaveBeenCalledWith(product.id);
  });
});
