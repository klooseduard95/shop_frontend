import { Component } from '@angular/core';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';
import { Product } from '../../../types/products.types';
import { MOCK_PRODUCTS } from '../../../mocks/products.mock';

@Component({
  imports: [ProductsListView],
  selector: 'app-products-list',
  styleUrl: './products-list.css',
  templateUrl: './products-list.html',
})
export class ProductsList {
  products: Product[] = MOCK_PRODUCTS;

  handleProductSelection(selectedProduct: Product): void {
    console.log('Product selected', selectedProduct.name);
  }
}
