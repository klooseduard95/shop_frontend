import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ShoppingCartDetails } from './shopping-cart-details';
import { provideMockStore } from '@ngrx/store/testing';
import {
  selectCartError,
  selectCartItems,
  selectCartTotal,
} from '../../../state/cart.reducer';
import { Store } from '@ngrx/store';
import { checkout, removeFromCart } from '../../../state/cart.actions';
import { createMockProduct } from '../../../../../mocks/products.mock';

describe('ShoppingCartDetails', () => {
  let component: ShoppingCartDetails;
  let fixture: ComponentFixture<ShoppingCartDetails>;
  let store: Store;
  const cartItems = [{ product: createMockProduct(), quantity: 2 }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartDetails],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          selectors: [
            { selector: selectCartItems, value: cartItems },
            { selector: selectCartTotal, value: cartItems[0].product.price * 2 },
            { selector: selectCartError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ShoppingCartDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read cart items from the store', () => {
    expect(component.cartItems()).toEqual(cartItems);
  });

  it('should dispatch remove from cart', () => {
    component.handleRemoveItem(cartItems[0].product.id);

    expect(store.dispatch).toHaveBeenCalledWith(
      removeFromCart({ productId: cartItems[0].product.id }),
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
});
