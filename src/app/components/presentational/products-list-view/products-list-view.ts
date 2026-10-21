import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';

@Component({
  imports: [],
  selector: 'app-products-list-view',
  styleUrl: './products-list-view.css',
  templateUrl: './products-list-view.html',
})
export class ProductsListView {
  @Input() products: Product[] = [];
  @Output() productSelected = new EventEmitter<Product>();

  onSelectProduct(product: Product) {
    this.productSelected.emit(product);
  };
}
