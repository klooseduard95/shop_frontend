import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../features/shared/types/products.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-list-view',
  styleUrl: './products-list-view.scss',
  templateUrl: './products-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ProductsListView {
  products = input<Product[]>([]);
}
