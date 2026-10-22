import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';

@Component({
  selector: 'app-products-list-view',
  styleUrl: './products-list-view.scss',
  templateUrl: './products-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductsListView {
  products = input<Product[]>([]);
  productSelected = output<Product>();
}
