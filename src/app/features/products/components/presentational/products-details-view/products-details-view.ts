import { Component, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-details-view',
  styleUrl: './products-details-view.scss',
  templateUrl: './products-details-view.html',
  imports: [RouterLink],
})
export class ProductsDetailsView {
  product = input<Product | null>(null);
  isAdmin = input<boolean>(false);
  addToCart = output<Product>();
  deleteProduct = output<string>();
}
