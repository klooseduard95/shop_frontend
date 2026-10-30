import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { authReducer } from './core/state/auth/auth.reducer';
import { productsReducer } from './features/products/state/products.reducer';
import { cartReducer } from './features/shopping-cart/state/cart.reducer';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './core/state/auth/auth.effects';
import { ProductsEffects } from './features/products/state/products.effects';
import { CartEffects } from './features/shopping-cart/state/cart.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideStore({
      products: productsReducer,
      auth: authReducer,
      cart: cartReducer,
    }),
    provideEffects(AuthEffects, ProductsEffects, CartEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
