import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-products-list-view',
  styleUrl: './products-list-view.scss',
  templateUrl: './products-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton],
})
export class ProductsListView {
  products = input<Product[]>([]);
  isAdmin = input(false);
  deleteProduct = output<string>();
}
