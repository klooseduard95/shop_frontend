import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { catchError, exhaustMap, filter, map, of, withLatestFrom } from 'rxjs';
import {
  authInitialized,
  loginSuccess,
  logout,
  restoreSessionFailure,
  restoreSessionSuccess,
  sessionClearedInAnotherTab,
} from '../../auth/state/auth.actions';
import { selectCurrentUser } from '../../auth/state/auth.reducer';
import { UserProfile } from '../../shared/types/users.types';
import { CartStorageService } from '../services/cart-storage.service';
import { CartService } from '../services/cart.service';
import { CartStorageChange } from '../types/cart.types';
import { areCartItemsEqual, mergeCartItems } from '../utils/cart.utils';
import {
  addToCart,
  cartHydrated,
  cartPersisted,
  cartSyncedFromAnotherTab,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  removeFromCart,
} from './cart.actions';
import { CartState, selectCartItems, selectCartState } from './cart.reducer';

@Injectable({
  providedIn: 'root',
})
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly cartService = inject(CartService);
  private readonly cartStorage = inject(CartStorageService);
  private readonly store = inject(Store);

  hydrateCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        authInitialized,
        restoreSessionSuccess,
        restoreSessionFailure,
        loginSuccess,
        logout,
        sessionClearedInAnotherTab,
      ),
      withLatestFrom(this.store.select(selectCurrentUser), this.store.select(selectCartState)),
      map(([, user, cart]) => this.hydrateFor(user, cart)),
    ),
  );

  persistCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addToCart, removeFromCart, checkoutSuccess),
      withLatestFrom(this.store.select(selectCartState)),
      filter(([, cart]) => typeof cart.ownerKey === 'string'),
      map(([, cart]) =>
        cartPersisted({
          revision: this.cartStorage.write(cart.ownerKey as string, cart.items).revision,
        }),
      ),
    ),
  );

  syncCartBetweenTabs$ = createEffect(() =>
    this.cartStorage.changes$.pipe(
      withLatestFrom(this.store.select(selectCartState)),
      map(([change, cart]) => this.resolveRemoteChange(change, cart)),
      filter((action): action is Action => action !== null),
    ),
  );

  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(checkout),
      withLatestFrom(this.store.select(selectCartItems), this.store.select(selectCurrentUser)),
      exhaustMap(([{ deliveryAddress }, items, user]) => {
        const userId = user?.id;
        if (!userId || items.length === 0) {
          return of(
            checkoutFailure({
              error: 'A signed-in customer and a non-empty cart are required.',
            }),
          );
        }

        return this.cartService
          .checkout({
            userId,
            deliveryAddress,
            products: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          })
          .pipe(
            map(() => checkoutSuccess()),
            catchError((error: Error) => of(checkoutFailure({ error: error.message }))),
          );
      }),
    ),
  );

  private hydrateFor(user: UserProfile | null, cart: CartState): Action {
    const ownerKey = this.cartStorage.ownerKeyFor(user);
    const isGuest = ownerKey === CartStorageService.guestOwnerKey;

    const pendingItems = cart.ownerKey === null ? cart.items : [];
    const claimedGuestItems = isGuest ? [] : this.cartStorage.claimGuestCart();

    const stored = this.cartStorage.read(ownerKey);
    const items = mergeCartItems(stored.items, [...claimedGuestItems, ...pendingItems]);
    const persisted = areCartItemsEqual(items, stored.items)
      ? stored
      : this.cartStorage.write(ownerKey, items);

    return cartHydrated({ ownerKey, items: persisted.items, revision: persisted.revision });
  }

  private resolveRemoteChange(change: CartStorageChange, cart: CartState): Action | null {
    if (cart.ownerKey === null) {
      return null;
    }

    if (change.ownerKey === null) {
      return cartSyncedFromAnotherTab({ items: [], revision: 0 });
    }

    if (change.ownerKey !== cart.ownerKey) {
      return null;
    }

    if (change.cart === null) {
      return cartSyncedFromAnotherTab({ items: [], revision: 0 });
    }

    if (
      change.cart.writerId === this.cartStorage.writerId ||
      change.cart.revision <= cart.revision
    ) {
      return null;
    }

    return cartSyncedFromAnotherTab({
      items: change.cart.items,
      revision: change.cart.revision,
    });
  }
}
