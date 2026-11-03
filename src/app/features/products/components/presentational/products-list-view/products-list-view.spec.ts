import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { ProductsListView } from './products-list-view';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { By } from '@angular/platform-browser';

describe('ProductsListView', () => {
  let component: ProductsListView;
  let fixture: ComponentFixture<ProductsListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListView],
      providers: [
        provideRouter([
          {
            path: 'products/:id',
            component: ProductsListView,
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a product and link its View control to that product detail route', () => {
    const product = createMockProduct({
      id: 'product-1',
      name: 'Coffee grinder',
    });

    fixture.componentRef.setInput('products', [product]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const viewLink = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .find((link) => link.nativeElement.textContent?.trim() === 'View')
      ?.injector.get(RouterLink);

    expect(element.textContent).toContain('Coffee grinder');
    expect(element.textContent).toContain(`${product.price} EUR`);
    expect(router.serializeUrl(viewLink!.urlTree!)).toBe('/products/product-1');
  });

  it('should emit a deletion request for administrators', () => {
    const product = createMockProduct({ id: 'product-1' });
    const deleteProduct = vi.fn();

    component.deleteProduct.subscribe(deleteProduct);
    fixture.componentRef.setInput('products', [product]);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();

    const deleteButton = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.trim() === 'Delete',
    );

    deleteButton?.click();

    expect(deleteProduct).toHaveBeenCalledWith(product.id);
  });

  it('should hide deletion controls for customers', () => {
    fixture.componentRef.setInput('products', [createMockProduct()]);
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).not.toContain('Delete');
    expect([...element.querySelectorAll('button')]).toHaveLength(1);
  });

  it('should render an empty state when there are no products', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No products found.');
  });
});
