import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';

@Component({
  selector: 'app-products-details-view',
  styleUrl: './products-details-view.css',
  templateUrl: './products-details-view.html',
})
export class ProductsDetailsView {
  @Input() product: Product | null = null;
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(): void {
    if (this.product) {
      this.addToCart.emit(this.product);
    }
  }
}
