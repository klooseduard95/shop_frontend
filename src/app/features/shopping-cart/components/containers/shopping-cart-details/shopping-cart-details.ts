import { Component } from '@angular/core';
import { CartItem } from '../../../../shared/types/cart.types';

@Component({
  selector: 'app-shopping-cart-details',
  standalone: false,
  styleUrl: './shopping-cart-details.css',
  templateUrl: './shopping-cart-details.html',
})
export class ShoppingCartDetails {
  mockCartItems: CartItem[] = [
    {
      product: { id: 1, name: 'Wireless Headphones', category: 'Electronics', description: '', price: 150, imageUrl: '' },
      quantity: 1
    },
    {
      product: { id: 2, name: 'Mechanical Keyboard', category: 'Peripherals', description: '', price: 100, imageUrl: '' },
      quantity: 2
    }
  ];

  handleRemoveItem(productId: number): void {
    this.mockCartItems = this.mockCartItems.filter(item => item.product.id !== productId);
  }

  handleCheckout(): void {
    console.log('Proceeding to checkout with items:', this.mockCartItems);
  }

}
