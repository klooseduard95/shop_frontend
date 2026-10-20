import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductsList } from './components/containers/products-list/products-list';
import { ProductsDetails } from './components/containers/products-details/products-details';
import { Product } from './types/products.types';

@Component({
  imports: [RouterOutlet, ProductsList, ProductsDetails],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  selectedProduct = signal<Product | null>(null);

  onProductSelected(product: Product): void {
    this.selectedProduct.set(product);
  }
}
