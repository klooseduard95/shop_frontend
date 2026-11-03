import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ShoppingCartDetailsView } from '../../presentational/shopping-cart-details-view/shopping-cart-details-view';
import { AddressRequest } from '../../../types/order.types';
import { Store } from '@ngrx/store';
import {
  selectCartError,
  selectCartItemDetails,
  selectCartTotal,
} from '../../../state/cart.reducer';
import { checkout, removeFromCart } from '../../../state/cart.actions';
import { loadProducts } from '../../../../products/state/products.actions';

@Component({
  selector: 'app-shopping-cart-details',
  imports: [ShoppingCartDetailsView],
  templateUrl: './shopping-cart-details.html',
  styleUrl: './shopping-cart-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCartDetails implements OnInit {
  private readonly store = inject(Store);

  readonly cartItems = this.store.selectSignal(selectCartItemDetails);
  readonly cartTotal = this.store.selectSignal(selectCartTotal);
  readonly checkoutError = this.store.selectSignal(selectCartError);

  checkoutForm = new FormGroup({
    country: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    city: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    county: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    streetAddress: new FormControl('', { validators: [Validators.required], nonNullable: true }),
  });

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

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
