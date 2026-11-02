import { Injectable } from '@angular/core';
import { filter, fromEvent, map, Observable, share } from 'rxjs';
import { UserProfile } from '../../shared/types/users.types';
import { CartItem, CartStorageChange, PersistedCart } from '../types/cart.types';
import { sanitizeCartItems } from '../utils/cart.utils';

const EMPTY_PERSISTED_CART: PersistedCart = {
  items: [],
  revision: 0,
  updatedAt: 0,
  writerId: '',
};

@Injectable({
  providedIn: 'root',
})
export class CartStorageService {
  static readonly storageKeyPrefix = 'cart:';
  static readonly guestOwnerKey = 'cart:guest';

  readonly writerId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  readonly changes$: Observable<CartStorageChange> = fromEvent<StorageEvent>(
    window,
    'storage',
  ).pipe(
    filter((event) => event.storageArea === localStorage),
    filter(
      (event) => event.key === null || event.key.startsWith(CartStorageService.storageKeyPrefix),
    ),
    map((event) => ({
      ownerKey: event.key,
      cart: event.key === null ? null : this.parse(event.newValue),
    })),
    share(),
  );

  ownerKeyFor(user: UserProfile | null | undefined): string {
    return user
      ? `${CartStorageService.storageKeyPrefix}user:${user.id}`
      : CartStorageService.guestOwnerKey;
  }

  read(ownerKey: string): PersistedCart {
    try {
      return this.parse(localStorage.getItem(ownerKey)) ?? EMPTY_PERSISTED_CART;
    } catch {
      return EMPTY_PERSISTED_CART;
    }
  }

  write(ownerKey: string, items: CartItem[]): PersistedCart {
    const persisted: PersistedCart = {
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      revision: this.read(ownerKey).revision + 1,
      updatedAt: Date.now(),
      writerId: this.writerId,
    };

    try {
      localStorage.setItem(ownerKey, JSON.stringify(persisted));
    } catch {
      // Quota exceeded or storage disabled: keep the in-memory cart working.
    }

    return persisted;
  }

  remove(ownerKey: string): void {
    try {
      localStorage.removeItem(ownerKey);
    } catch {
      // Storage disabled.
    }
  }

  claimGuestCart(): CartItem[] {
    const guestCart = this.read(CartStorageService.guestOwnerKey);

    if (guestCart.items.length > 0) {
      this.remove(CartStorageService.guestOwnerKey);
    }

    return guestCart.items;
  }

  private parse(raw: string | null): PersistedCart | null {
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<PersistedCart> | null;

      return {
        items: sanitizeCartItems(parsed?.items),
        revision: Number.isFinite(Number(parsed?.revision)) ? Number(parsed?.revision) : 0,
        updatedAt: Number.isFinite(Number(parsed?.updatedAt)) ? Number(parsed?.updatedAt) : 0,
        writerId: typeof parsed?.writerId === 'string' ? parsed.writerId : '',
      };
    } catch {
      return null;
    }
  }
}
