import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthEffects } from './features/auth/state/auth.effects';
import { authReducer } from './features/auth/state/auth.reducer';
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { ProductsEffects } from './features/products/state/products.effects';
import { productsReducer } from './features/products/state/products.reducer';
import { CartEffects } from './features/shopping-cart/state/cart.effects';
import { cartReducer } from './features/shopping-cart/state/cart.reducer';

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
