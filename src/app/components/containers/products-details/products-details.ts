import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';
import { ProductsDetailsView } from '../../presentational/products-details-view/products-details-view';

@Component({
  selector: 'app-products-details',
  imports: [ProductsDetailsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-details.scss',
  templateUrl: './products-details.html',
})
export class ProductsDetails {
  product = input<Product | null>(null);

  handleAddToCart(product: Product): void {
    console.log('Product added to cart', product);
  }
}
