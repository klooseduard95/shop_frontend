import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductRequest } from '../../../types/products.types';
import { ProductsFormView } from '../../presentational/products-form-view/products-form-view';
import { Store } from '@ngrx/store';
import {
  createProduct,
  loadProduct,
  resetProductSaveState,
  updateProduct,
} from '../../../../shared/state/app.actions';
import {
  selectProductSaveError,
  selectProductSaving,
  selectSelectedProduct,
} from '../../../../shared/state/app.reducers';

@Component({
  selector: 'app-products-form',
  imports: [ProductsFormView],
  templateUrl: './products-form.html',
  styleUrl: './products-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly isEditMode = signal(false);
  readonly saving = this.store.selectSignal(selectProductSaving);
  readonly saveError = this.store.selectSignal(selectProductSaveError);
  private readonly selectedProduct = this.store.selectSignal(selectSelectedProduct);
  private currentProductId: string | null = null;
  private patchedProductId: string | null = null;

  productForm = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    price: new FormControl(0, {
      validators: [Validators.required, Validators.min(0.01)],
      nonNullable: true,
    }),
    weight: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
      nonNullable: true,
    }),
    categoryId: new FormControl('123e4567-e89b-12d3-a456-426614174000', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  private readonly patchSelectedProduct = effect(() => {
    const product = this.selectedProduct();

    if (product && product.id === this.currentProductId && product.id !== this.patchedProductId) {
      this.productForm.patchValue({
        name: product.name,
        price: product.price,
        weight: product.weight,
        categoryId: product.categoryId,
      });
      this.patchedProductId = product.id;
    }
  });

  ngOnInit(): void {
    this.store.dispatch(resetProductSaveState());
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.currentProductId = id;
      this.store.dispatch(loadProduct({ id }));
    }
  }

  handleSave(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product: ProductRequest = this.productForm.getRawValue();

    if (this.currentProductId) {
      this.store.dispatch(updateProduct({ id: this.currentProductId, product }));
    } else {
      this.store.dispatch(createProduct({ product }));
    }
  }

  async handleCancel(): Promise<void> {
    await this.router.navigate(['/products']);
  }
}
