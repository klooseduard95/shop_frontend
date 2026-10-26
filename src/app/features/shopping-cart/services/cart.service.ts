import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../types/cart.types';
import { Product } from '../../products/types/products.types';
import { OrderCreateRequest } from '../types/order.types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
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

  checkout(): void {
    const currentItems = this.#items();
    if (currentItems.length === 0) return;

    const payload: OrderCreateRequest = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      deliveryAddress: {
        country: 'Romania',
        city: 'Cluj-Napoca',
        county: 'Cluj',
        streetAddress: 'Strada Observatorului, Nr. 34',
      },
      products: currentItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.http.post(`${environment.apiUrl}/orders`, payload).subscribe({
      next: (response) => {
        console.log('Order created successfully!', response);
        alert('Comanda a fost plasată cu succes!');
        this.#items.set([]);
      },
      error: (err) => {
        console.error('Checkout failed', err);
        alert('A apărut o eroare la plasarea comenzii.');
      },
    });
  }
}
