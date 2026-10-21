import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductsList } from './components/containers/products-list/products-list';
import { ProductsDetails } from './components/containers/products-details/products-details';
import { Product } from './features/shared/types/products.types';
import { ShoppingCartModule } from './features/shopping-cart/shopping-cart.module';

@Component({
  imports: [RouterOutlet, ProductsList, ProductsDetails, ShoppingCartModule],
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
