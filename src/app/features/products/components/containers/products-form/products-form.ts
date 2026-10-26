import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductRequest } from '../../../types/products.types';
import { ProductsFormView } from '../../presentational/products-form-view/products-form-view';

@Component({
  imports: [ProductsFormView],
  selector: 'app-products-form',
  styleUrl: './products-form.scss',
  templateUrl: './products-form.html',
})
export class ProductsForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  isEditMode = signal(false);
  currentProductId: string | null = null;

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.currentProductId = id;
      this.productsService.getProductById(id).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product.name,
            price: product.price,
            weight: product.weight,
            categoryId: product.categoryId,
          });
        },
        error: (err) => {
          console.error('Error fetching product:', err);
        },
      });
    }
  }

  handleSave() {
    if (this.productForm.invalid) {
      return;
    }

    const request: ProductRequest = this.productForm.getRawValue();

    const saveObservable =
      this.isEditMode() && this.currentProductId
        ? this.productsService.updateProduct(this.currentProductId, request)
        : this.productsService.createProduct(request);

    saveObservable.subscribe({
      next: async () => {
        console.log('Successfully updated product');
        await this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error saving product:', err);
      },
    });
  }

  async handleCancel(): Promise<void> {
    await this.router.navigate(['/products']);
  }
}
