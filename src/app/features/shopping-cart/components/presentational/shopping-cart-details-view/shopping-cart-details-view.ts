import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CartItem } from '../../../types/cart.types';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-shopping-cart-details-view',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatIconButton,
    MatIcon,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shopping-cart-details-view.scss',
  templateUrl: './shopping-cart-details-view.html',
})
export class ShoppingCartDetailsView {
  cartItems = input<CartItem[]>([]);
  totalPrice = input<number>(0);
  checkoutForm = input.required<FormGroup>();
  checkoutError = input<string | null>(null);

  removeItem = output<string>();
  checkout = output<void>();

  displayedColumns: string[] = ['category', 'product', 'price', 'quantity', 'actions'];
}
