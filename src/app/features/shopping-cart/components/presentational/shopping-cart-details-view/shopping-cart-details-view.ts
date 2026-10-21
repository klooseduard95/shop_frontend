import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../../../shared/types/cart.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-cart-details-view',
  imports: [CommonModule],
  styleUrl: './shopping-cart-details-view.css',
  templateUrl: './shopping-cart-details-view.html'
})
export class ShoppingCartDetailsView {
  @Input() cartItems: CartItem[] = [];
  @Output() removeItem = new EventEmitter<number>();
  @Output() checkout = new EventEmitter<void>();

  onRemove(productId: number): void {
    this.removeItem.emit(productId);
  }

  onCheckout(): void {
    this.checkout.emit();
  }
}
