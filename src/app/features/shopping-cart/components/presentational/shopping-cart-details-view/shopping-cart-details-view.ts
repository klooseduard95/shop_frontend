import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CartItem } from '../../../../shared/types/cart.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-cart-details-view',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shopping-cart-details-view.scss',
  templateUrl: './shopping-cart-details-view.html',
})
export class ShoppingCartDetailsView {
  cartItems = input<CartItem[]>([]);
  totalPrice = input<number>(0);

  removeItem = output<string>();
  checkout = output<void>();
}
