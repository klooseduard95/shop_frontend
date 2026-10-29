import { Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-products-details-view',
  styleUrl: './products-details-view.scss',
  templateUrl: './products-details-view.html',
  imports: [RouterLink, MatButton, MatIcon],
})
export class ProductsDetailsView {
  product = input<Product | null>(null);
  isAdmin = input<boolean>(false);
  addToCart = output<Product>();
  deleteProduct = output<string>();
}
