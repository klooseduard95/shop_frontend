import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ShoppingCartDetailsView } from './shopping-cart-details-view';
import { createMockProduct } from '../../../../../mocks/products.mock';

describe('ShoppingCartDetailsView', () => {
  let component: ShoppingCartDetailsView;
  let fixture: ComponentFixture<ShoppingCartDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartDetailsView],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingCartDetailsView);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'checkoutForm',
      new FormGroup({
        country: new FormControl(''),
        city: new FormControl(''),
        county: new FormControl(''),
        streetAddress: new FormControl(''),
      }),
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render cart details, total, and remove an item', () => {
    const product = createMockProduct({ id: 'product-1', name: 'Coffee grinder', price: 99 });
    const removeItem = vi.fn();
    component.removeItem.subscribe(removeItem);
    fixture.componentRef.setInput('cartItems', [{ productId: product.id, product, quantity: 2 }]);
    fixture.componentRef.setInput('totalPrice', 198);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const removeButton = element.querySelector<HTMLButtonElement>('button[color="warn"]');

    expect(element.textContent).toContain('Coffee grinder');
    expect(element.textContent).toContain('198 RON');
    removeButton?.click();
    expect(removeItem).toHaveBeenCalledWith(product.id);
  });

  it('should show an empty cart and disable checkout for an invalid form', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const checkoutButton = element.querySelector<HTMLButtonElement>('button[form="checkout-form"]');

    expect(element.textContent).toContain('Your shopping cart is empty.');
    expect(checkoutButton?.disabled).toBe(true);
  });

  it('should emit checkout when a valid form is submitted', () => {
    const checkout = vi.fn();
    component.checkout.subscribe(checkout);
    component.checkoutForm().setValue({
      country: 'Romania',
      city: 'Cluj-Napoca',
      county: 'Cluj',
      streetAddress: 'Main Street 1',
    });
    fixture.componentRef.setInput('cartItems', [
      { productId: 'product-1', product: createMockProduct({ id: 'product-1' }), quantity: 1 },
    ]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLFormElement>('#checkout-form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    expect(checkout).toHaveBeenCalledOnce();
  });
});
