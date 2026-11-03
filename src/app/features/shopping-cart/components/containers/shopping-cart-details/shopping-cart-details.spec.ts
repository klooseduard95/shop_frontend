import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ShoppingCartDetails } from './shopping-cart-details';
import { provideMockStore } from '@ngrx/store/testing';
import {
  selectCartError,
  selectCartItemDetails,
  selectCartTotal,
} from '../../../state/cart.selectors';
import { Store } from '@ngrx/store';
import { checkout, removeFromCart } from '../../../state/cart.actions';
import { loadProducts } from '../../../../products/state/products.actions';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { ShoppingCartDetailsView } from '../../presentational/shopping-cart-details-view/shopping-cart-details-view';
import { By } from '@angular/platform-browser';

describe('ShoppingCartDetails', () => {
  let component: ShoppingCartDetails;
  let fixture: ComponentFixture<ShoppingCartDetails>;
  let store: Store;
  const product = createMockProduct();
  const cartItems = [{ productId: product.id, product, quantity: 2 }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartDetails],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          selectors: [
            { selector: selectCartItemDetails, value: cartItems },
            { selector: selectCartTotal, value: product.price * 2 },
            { selector: selectCartError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ShoppingCartDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read cart items from the store', () => {
    expect(component.cartItems()).toEqual(cartItems);
  });

  it('should refresh products for current prices', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
  });

  it('should dispatch remove from cart', () => {
    component.handleRemoveItem(cartItems[0].productId);

    expect(store.dispatch).toHaveBeenCalledWith(
      removeFromCart({ productId: cartItems[0].productId }),
    );
  });

  it('should dispatch checkout for a valid form', () => {
    const deliveryAddress = {
      country: 'Romania',
      city: 'Cluj-Napoca',
      county: 'Cluj',
      streetAddress: 'Main Street 1',
    };
    component.checkoutForm.setValue(deliveryAddress);

    component.handleCheckout();

    expect(store.dispatch).toHaveBeenCalledWith(checkout({ deliveryAddress }));
  });

  it('should not dispatch checkout for an invalid form', () => {
    component.handleCheckout();

    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: checkout.type }),
    );
    expect(component.checkoutForm.controls.country.touched).toBe(true);
  });

  it('should handle remove events emitted by the cart view', () => {
    const view = fixture.debugElement.query(By.directive(ShoppingCartDetailsView))
      .componentInstance as ShoppingCartDetailsView;

    view.removeItem.emit(cartItems[0].productId);

    expect(store.dispatch).toHaveBeenCalledWith(
      removeFromCart({
        productId: cartItems[0].productId,
      }),
    );
  });

  it('should handle checkout events emitted by the cart view', () => {
    const deliveryAddress = {
      country: 'Romania',
      city: 'Cluj-Napoca',
      county: 'Cluj',
      streetAddress: 'Main Street 1',
    };

    component.checkoutForm.setValue(deliveryAddress);

    const view = fixture.debugElement.query(By.directive(ShoppingCartDetailsView))
      .componentInstance as ShoppingCartDetailsView;

    view.checkout.emit();

    expect(store.dispatch).toHaveBeenCalledWith(
      checkout({
        deliveryAddress,
      }),
    );
  });
});
