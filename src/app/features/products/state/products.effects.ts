import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ProductsService } from '../services/products.service';
import {
  createProduct,
  createProductFailure,
  createProductSuccess,
  deleteProduct,
  deleteProductFailure,
  deleteProductSuccess,
  loadProduct,
  loadProductFailure,
  loadProductSuccess,
  loadProducts,
  loadProductsFailure,
  loadProductsSuccess,
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from './products.actions';

@Injectable({
  providedIn: 'root',
})
export class ProductsEffects {
  private readonly actions$ = inject(Actions);
  private readonly productService = inject(ProductsService);
  private readonly router = inject(Router);

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
}
