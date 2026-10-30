import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductsListView } from './products-list-view';
import { createMockProduct } from '../../../../../mocks/products.mock';

describe('ProductsListView', () => {
  let component: ProductsListView;
  let fixture: ComponentFixture<ProductsListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListView],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render products and emit a deletion for administrators', () => {
    const product = createMockProduct({ id: 'product-1', name: 'Coffee grinder' });
    const deleteProduct = vi.fn();
    component.deleteProduct.subscribe(deleteProduct);
    fixture.componentRef.setInput('products', [product]);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const deleteButton = [...element.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Delete',
    );

    expect(element.textContent).toContain('Coffee grinder');
    expect(element.textContent).toContain(`${product.price} EUR`);
    deleteButton?.click();
    expect(deleteProduct).toHaveBeenCalledWith(product.id);
  });

  it('should hide deletion controls for customers and render an empty state', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('No products found.');
    expect(element.textContent).not.toContain('Delete');
  });
});
