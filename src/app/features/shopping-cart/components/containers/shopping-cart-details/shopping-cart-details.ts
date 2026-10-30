import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ShoppingCartDetailsView } from '../../presentational/shopping-cart-details-view/shopping-cart-details-view';
import { AddressRequest } from '../../../types/order.types';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import {
  selectCartError,
  selectCartItems,
  selectCartTotal,
} from '../../../../shared/state/app.reducers';
import { checkout, removeFromCart } from '../../../../shared/state/app.actions';

@Component({
  selector: 'app-shopping-cart-details',
  imports: [ShoppingCartDetailsView],
  templateUrl: './shopping-cart-details.html',
  styleUrl: './shopping-cart-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCartDetails {
  private readonly store = inject(Store<AppState>);

  readonly cartItems = this.store.selectSignal(selectCartItems);
  readonly cartTotal = this.store.selectSignal(selectCartTotal);
  readonly checkoutError = this.store.selectSignal(selectCartError);

  checkoutForm = new FormGroup({
    country: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    city: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    county: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    streetAddress: new FormControl('', { validators: [Validators.required], nonNullable: true }),
  });

  handleCheckout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const address: AddressRequest = this.checkoutForm.getRawValue();
    this.store.dispatch(checkout({ deliveryAddress: address }));
  }

  handleRemoveItem(productId: string): void {
    this.store.dispatch(removeFromCart({ productId }));
  }
}
