import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductRequest } from '../../../types/products.types';
import { ProductsFormView } from '../../presentational/products-form-view/products-form-view';
import { Store } from '@ngrx/store';
import {
  createProduct,
  loadProduct,
  resetProductSaveState,
  updateProduct,
} from '../../../state/products.actions';
import {
  selectProductSaveError,
  selectProductSaving,
  selectSelectedProduct,
} from '../../../state/products.reducer';

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

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );
  readonly isEditMode = computed(() => !!this.productId());
  readonly saving = this.store.selectSignal(selectProductSaving);
  readonly saveError = this.store.selectSignal(selectProductSaveError);
  private readonly selectedProduct = this.store.selectSignal(selectSelectedProduct);
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

    if (product?.id === this.productId() && product.id !== this.patchedProductId) {
      this.productForm.patchValue({
        name: product.name,
        price: product.price,
        weight: product.weight,
        categoryId: product.categoryId,
      });
      this.patchedProductId = product.id;
    }
  });

  private readonly loadProductEffect = effect(() => {
    const id = this.productId();
    if (id) {
      this.store.dispatch(loadProduct({ id }));
    }
  });

  ngOnInit(): void {
    this.store.dispatch(resetProductSaveState());
  }

  handleSave(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product: ProductRequest = this.productForm.getRawValue();

    const id = this.productId();
    if (id) {
      this.store.dispatch(updateProduct({ id, product }));
    } else {
      this.store.dispatch(createProduct({ product }));
    }
  }

  async handleCancel(): Promise<void> {
    await this.router.navigate(['/products']);
  }
}
