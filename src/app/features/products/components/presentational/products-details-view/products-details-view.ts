import { Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';

@Component({
  selector: 'app-products-details-view',
  styleUrl: './products-details-view.scss',
  templateUrl: './products-details-view.html',
})
export class ProductsDetailsView {
  product = input<Product | null>(null);
  addToCart = output<Product>();
  deleteProduct = output<string>();
}
