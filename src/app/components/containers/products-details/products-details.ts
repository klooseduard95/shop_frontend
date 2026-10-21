import { Component, Input } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';
import { ProductsDetailsView } from '../../presentational/products-details-view/products-details-view';

@Component({
  imports: [ProductsDetailsView],
  selector: 'app-products-details',
  styleUrl: './products-details.css',
  templateUrl: './products-details.html',
})
export class ProductsDetails {
  @Input() product: Product | null = null;

  handleAddToCart(product: Product): void {
    console.log('Product added to cart', product);
  }
}
