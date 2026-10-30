import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, withLatestFrom } from 'rxjs';
import { selectCurrentUser } from '../../../core/state/auth/auth.reducer';
import { CartService } from '../services/cart.service';
import { checkout, checkoutFailure, checkoutSuccess } from './cart.actions';
import { selectCartItems } from './cart.reducer';

@Injectable({
  providedIn: 'root',
})
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly cartService = inject(CartService);
  private readonly store = inject(Store);

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
}
