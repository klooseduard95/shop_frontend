import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ProductsDetailsView } from '../../presentational/products-details-view/products-details-view';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../../../types/products.types';
import { Store } from '@ngrx/store';
import { deleteProduct, loadProduct } from '../../../state/products.actions';
import { addToCart } from '../../../../shopping-cart/state/cart.actions';
import { selectSelectedProduct } from '../../../state/products.reducer';
import { selectIsAdmin } from '../../../../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-products-details',
  imports: [ProductsDetailsView],
  templateUrl: './products-details.html',
  styleUrl: './products-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  private readonly id = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => !!id),
    ),
  );

  readonly product = this.store.selectSignal(selectSelectedProduct);
  readonly isAdmin = this.store.selectSignal(selectIsAdmin);

  private readonly loadProductEffect = effect(() => {
    const id = this.id();
    if (id) {
      this.store.dispatch(loadProduct({ id }));
    }
  });

  handleAddToCart(product: Product): void {
    this.store.dispatch(addToCart({ product }));
  }

  handleDelete(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.store.dispatch(deleteProduct({ id }));
    }
  }
}
