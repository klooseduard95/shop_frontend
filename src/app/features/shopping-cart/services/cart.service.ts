import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { CartItem } from '../types/cart.types';
import { Product } from '../../products/types/products.types';
import { AddressRequest, OrderCreateRequest } from '../types/order.types';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  readonly #items = signal<CartItem[]>([]);
  readonly cartItems = this.#items.asReadonly();
  readonly cartTotal = computed(() => {
    return this.#items().reduce((total, item) => total + item.product.price * item.quantity, 0);
  });

  addToCart(product: Product): void {
    this.#items.update((currentItems) => {
      const existingItem = currentItems.some((item) => item.product.id === product.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: string): void {
    this.#items.update((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }

  checkout(deliveryAddress: AddressRequest): Observable<void> {
    const currentItems = this.#items();
    const userId = this.authService.currentUser()?.id;

    if (currentItems.length === 0 || !userId) {
      return throwError(() => new Error('A signed-in customer and a non-empty cart are required.'));
    }

    const payload: OrderCreateRequest = {
      userId,
      deliveryAddress,
      products: currentItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    return this.http
      .post<void>(`${environment.apiUrl}/api/orders`, payload)
      .pipe(tap(() => this.#items.set([])));
  }
}
