import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { ProductsService } from '../../products/services/products.service';
import {
  deleteProduct,
  deleteProductFailure,
  deleteProductSuccess,
  checkout,
  checkoutFailure,
  checkoutSuccess,
  createProduct,
  createProductFailure,
  createProductSuccess,
  loadProduct,
  loadProductFailure,
  loadProducts,
  loadProductsFailure,
  loadProductsSuccess,
  loadProductSuccess,
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './app.actions';
import { catchError, exhaustMap, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { selectCartItems, selectCurrentUser } from './app.reducers';
import { CartService } from '../../shopping-cart/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppEffects {
  private readonly actions$ = inject(Actions);
  private readonly productService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store<AppState>);
  private readonly router = inject(Router);

  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => {
        const token = this.authService.getStoredToken();
        return token ? restoreSession({ token }) : authInitialized();
      }),
    ),
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(restoreSession),
      exhaustMap(() =>
        this.authService.getProfile().pipe(
          map((user) => restoreSessionSuccess({ user })),
          catchError((error: Error) => {
            this.authService.clearStoredToken();
            return of(restoreSessionFailure({ error: error.message }));
          }),
        ),
      ),
    ),
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          switchMap(({ token }) =>
            this.authService.getProfile(token).pipe(map((user) => loginSuccess({ user, token }))),
          ),
          catchError(() => of(loginFailure({ error: 'Invalid credentials. Please try again.' }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ token }) => {
          this.authService.storeToken(token);
          void this.router.navigate(['/products']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          this.authService.clearStoredToken();
          void this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      mergeMap(() =>
        this.productService.getProducts().pipe(
          map((products) => loadProductsSuccess({ products })),
          catchError((error: Error) => of(loadProductsFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProduct),
      switchMap(({ id }) =>
        this.productService.getProductById(id).pipe(
          map((product) => loadProductSuccess({ product })),
          catchError((error: Error) => of(loadProductFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteProduct),
      mergeMap(({ id }) =>
        this.productService.deleteProduct(id).pipe(
          map(() => deleteProductSuccess({ id })),
          catchError((error: Error) => of(deleteProductFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createProduct),
      exhaustMap(({ product }) =>
        this.productService.createProduct(product).pipe(
          map((createdProduct) => createProductSuccess({ product: createdProduct })),
          catchError((error: Error) => of(createProductFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProduct),
      exhaustMap(({ id, product }) =>
        this.productService.updateProduct(id, product).pipe(
          map((updatedProduct) => updateProductSuccess({ product: updatedProduct })),
          catchError((error: Error) => of(updateProductFailure({ error: error.message }))),
        ),
      ),
    ),
  );

  navigateAfterSave$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(createProductSuccess, updateProductSuccess),
        tap(() => void this.router.navigate(['/products'])),
      ),
    { dispatch: false },
  );

  navigateAfterDelete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(deleteProductSuccess),
        tap(() => void this.router.navigate(['/products'])),
      ),
    { dispatch: false },
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
              productId: item.product.id,
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
