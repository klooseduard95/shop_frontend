import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CartItem } from '../../../../shared/types/cart.types';
import { ShoppingCartDetailsView } from '../../presentational/shopping-cart-details-view/shopping-cart-details-view';
import { MOCK_CART_ITEMS } from '../../../../../mocks/cart.mock';

@Component({
  selector: 'app-shopping-cart-details',
  imports: [ShoppingCartDetailsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shopping-cart-details.scss',
  templateUrl: './shopping-cart-details.html',
})
export class ShoppingCartDetails {
  mockCartItems = signal<CartItem[]>([...MOCK_CART_ITEMS]);

  handleRemoveItem(productId: number): void {
    this.mockCartItems.update(items => items.filter(item => item.product.id !== productId));
  }

  handleCheckout(): void {
    console.log('Proceeding to checkout with items:', this.mockCartItems());
  }
}
