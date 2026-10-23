import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';
import { ProductsService } from '../../../services/products.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products-list',
  imports: [ProductsListView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList {
  private readonly productService = inject(ProductsService);
  products = toSignal(this.productService.getProducts());
}
