import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { ProductsDetailsView } from './products-details-view';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { By } from '@angular/platform-browser';

describe('ProductsDetailsView', () => {
  let component: ProductsDetailsView;
  let fixture: ComponentFixture<ProductsDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsDetailsView],
      providers: [
        provideRouter([
          {
            path: 'products/:id/edit',
            component: ProductsDetailsView,
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product details and emit add-to-cart', () => {
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

  it('should link the administrator Edit control to the product edit route', () => {
    const product = createMockProduct({ id: 'product-1' });

    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const editLink = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .find((link) => link.nativeElement.textContent?.includes('Edit'))
      ?.injector.get(RouterLink);

    expect(router.serializeUrl(editLink!.urlTree!)).toBe('/products/product-1/edit');
  });

  it('should show edit and delete controls only for administrators', () => {
    const product = createMockProduct({ id: 'product-1' });
    const deleteProduct = vi.fn();

    component.deleteProduct.subscribe(deleteProduct);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();

    const deleteButton = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Delete'),
    );

    expect(fixture.nativeElement.textContent).toContain('Edit');

    deleteButton?.click();

    expect(deleteProduct).toHaveBeenCalledWith(product.id);
  });

  it('should hide edit and delete controls for customers', () => {
    fixture.componentRef.setInput('product', createMockProduct());
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Add to Cart');
    expect(element.textContent).not.toContain('Edit');
    expect(element.textContent).not.toContain('Delete');
  });

  it('should render the placeholder while product data is unavailable', () => {
    fixture.componentRef.setInput('product', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Select a product from the list to view details.',
    );
  });
});
