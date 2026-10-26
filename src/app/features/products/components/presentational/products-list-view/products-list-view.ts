import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Product } from '../../../types/products.types';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-products-list-view',
  styleUrl: './products-list-view.scss',
  templateUrl: './products-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ProductsListView {
  products = input<Product[]>([]);
  deleteProduct = output<string>();
  protected readonly authService = inject(AuthService);
}
