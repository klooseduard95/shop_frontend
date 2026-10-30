import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-products-list-view',
  imports: [RouterLink, MatButton],
  templateUrl: './products-list-view.html',
  styleUrl: './products-list-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListView {
  products = input<Product[]>([]);
  isAdmin = input(false);
  deleteProduct = output<string>();
}
