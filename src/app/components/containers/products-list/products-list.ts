import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';
import { Product } from '../../../features/shared/types/products.types';
import { MOCK_PRODUCTS } from '../../../mocks/products.mock';

@Component({
  selector: 'app-products-list',
  imports: [ProductsListView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList {
  products = signal<Product[]>(MOCK_PRODUCTS);
}
