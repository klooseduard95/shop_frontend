import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';

import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton, MatSuffix],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-products-form-view',
  styleUrl: './products-form-view.scss',
  templateUrl: './products-form-view.html',
})
export class ProductsFormView {
  form = input.required<FormGroup>();
  isEditMode = input<boolean>(false);
  saving = input(false);
  saveError = input<string | null>(null);

  save = output<void>();
  cancel = output<void>();
}
