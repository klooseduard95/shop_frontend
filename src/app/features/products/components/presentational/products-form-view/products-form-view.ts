import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
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
