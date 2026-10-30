import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-products-details-view',
  imports: [RouterLink, MatButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-details-view.scss',
  templateUrl: './products-details-view.html',
})
export class ProductsDetailsView {
  product = input<Product | null>(null);
  isAdmin = input<boolean>(false);
  addToCart = output<Product>();
  deleteProduct = output<string>();
}
