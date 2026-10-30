import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductsListView } from '../../presentational/products-list-view/products-list-view';
import { Store } from '@ngrx/store';
import { deleteProduct, loadProducts } from '../../../../shared/state/app.actions';
import {
  selectAllProducts,
  selectIsAdmin,
  selectProductsLoading,
} from '../../../../shared/state/app.reducers';

@Component({
  selector: 'app-products-list',
  imports: [ProductsListView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList implements OnInit {
  private readonly store = inject(Store);

  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductsLoading);
  readonly isAdmin = this.store.selectSignal(selectIsAdmin);

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

  handleDelete(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.store.dispatch(deleteProduct({ id }));
    }
  }
}
