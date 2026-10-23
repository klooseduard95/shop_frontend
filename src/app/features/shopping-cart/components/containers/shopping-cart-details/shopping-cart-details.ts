import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShoppingCartDetailsView } from '../../presentational/shopping-cart-details-view/shopping-cart-details-view';
import { CartService } from '../../../../shared/services/cart.service';

@Component({
  selector: 'app-shopping-cart-details',
  imports: [ShoppingCartDetailsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shopping-cart-details.scss',
  templateUrl: './shopping-cart-details.html',
})
export class ShoppingCartDetails {
  cartService = inject(CartService);
}
