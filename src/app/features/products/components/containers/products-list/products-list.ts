import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';
import { ProductsService } from '../../../services/products.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-products-list',
  imports: [ProductsListView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList {
  private readonly productService = inject(ProductsService);
  private readonly reloadProducts = signal(0);

  products = toSignal(
    toObservable(this.reloadProducts).pipe(switchMap(() => this.productService.getProducts())),
    { initialValue: [] },
  );

  handleDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.reloadProducts.update((value) => value + 1);
      },
      error: (error) => {
        console.error('Failed to delete product', error);
      },
    });
  }
}
