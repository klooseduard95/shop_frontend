import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ShoppingCartDetailsView } from '../../presentational/shopping-cart-details-view/shopping-cart-details-view';
import { CartService } from '../../../services/cart.service';
import { AddressRequest } from '../../../types/order.types';

@Component({
  selector: 'app-shopping-cart-details',
  imports: [ShoppingCartDetailsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shopping-cart-details.scss',
  templateUrl: './shopping-cart-details.html',
})
export class ShoppingCartDetails {
  cartService = inject(CartService);
  checkoutError = signal<string | null>(null);

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
    this.checkoutError.set(null);
    this.cartService.checkout(address).subscribe({
      error: () => this.checkoutError.set('Unable to place the order. Please try again.'),
    });
  }
}
