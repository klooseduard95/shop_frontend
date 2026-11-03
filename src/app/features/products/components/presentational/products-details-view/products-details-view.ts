import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-products-details-view',
  imports: [RouterLink, MatButton, MatIcon],
  templateUrl: './products-details-view.html',
  styleUrl: './products-details-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetailsView {
  product = input<Product | null>(null);
  isAdmin = input<boolean>(false);
  addToCart = output<Product>();
  deleteProduct = output<string>();
}
