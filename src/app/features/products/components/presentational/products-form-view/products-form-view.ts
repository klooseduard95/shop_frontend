import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

export type ProductForm = FormGroup<{
  name: FormControl<string>;
  price: FormControl<number>;
  weight: FormControl<number>;
  categoryId: FormControl<string>;
}>;

@Component({
  selector: 'app-products-form-view',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton, MatSuffix],
  templateUrl: './products-form-view.html',
  styleUrl: './products-form-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFormView {
  form = input.required<ProductForm>();
  isEditMode = input<boolean>(false);
  saving = input(false);
  saveError = input<string | null>(null);

  save = output<void>();
  cancel = output<void>();
}
