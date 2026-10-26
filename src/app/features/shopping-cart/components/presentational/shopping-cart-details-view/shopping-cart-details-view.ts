import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CartItem } from '../../../types/cart.types';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopping-cart-details-view',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shopping-cart-details-view.scss',
  templateUrl: './shopping-cart-details-view.html',
})
export class ShoppingCartDetailsView {
  cartItems = input<CartItem[]>([]);
  totalPrice = input<number>(0);
  checkoutForm = input.required<FormGroup>();
  checkoutError = input<string | null>(null);

  removeItem = output<string>();
  checkout = output<void>();
}
