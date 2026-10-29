import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';
import { Store } from '@ngrx/store';
import { deleteProduct, loadProducts } from '../../../../shared/state/app.actions';
import {
  selectAllProducts,
  selectIsAdmin,
  selectProductsLoading,
} from '../../../../shared/state/app.reducers';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-products-list',
  imports: [ProductsListView, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList implements OnInit {
  private readonly store = inject(Store);

  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductsLoading);
  isAdmin$ = this.store.select(selectIsAdmin);

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

  handleDelete(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.store.dispatch(deleteProduct({ id }));
    }
  }
}
