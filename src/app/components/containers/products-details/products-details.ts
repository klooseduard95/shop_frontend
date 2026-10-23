import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';
import { ProductsDetailsView } from '../../presentational/products-details-view/products-details-view';
import { ActivatedRoute } from '@angular/router';
import { MOCK_PRODUCTS } from '../../../mocks/products.mock';

@Component({
  selector: 'app-products-details',
  imports: [ProductsDetailsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-details.scss',
  templateUrl: './products-details.html',
})
export class ProductsDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  product = signal<Product | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const productId = Number(idParam);
      const foundProduct = MOCK_PRODUCTS.find((p) => p.id === productId);

      if (foundProduct) {
        this.product.set(foundProduct);
      }
    }
  }

  handleAddToCart(product: Product): void {
    console.log('Product added to cart', product);
  }
}
