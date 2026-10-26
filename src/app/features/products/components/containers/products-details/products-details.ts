import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsDetailsView } from '../../presentational/products-details-view/products-details-view';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { filter, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../../shopping-cart/services/cart.service';
import { Product } from '../../../types/products.types';

@Component({
  selector: 'app-products-details',
  imports: [ProductsDetailsView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-details.scss',
  templateUrl: './products-details.html',
})
export class ProductsDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductsService);
  cartService = inject(CartService);

  private readonly id$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    filter((id): id is string => !!id),
  );

  product = toSignal(this.id$.pipe(switchMap((id) => this.productService.getProductById(id))));

  handleAddToCart(product: Product): void {
    this.cartService.addToCart(product);
    console.log(`Product ${product.name} added to cart. Total: ${this.cartService.cartTotal()}`);
  }

  handleDelete(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: async () => {
          console.log('Product deleted');
          await this.router.navigate(['/products']);
        },
        error: (err) => console.error('Failed to delete product', err),
      });
    }
  }
}
