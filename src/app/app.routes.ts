import { Routes } from '@angular/router';
import { ProductsList } from './features/products/components/containers/products-list/products-list';
import { ProductsDetails } from './features/products/components/containers/products-details/products-details';
import { ShoppingCartDetails } from './features/shopping-cart/components/containers/shopping-cart-details/shopping-cart-details';
import { ProductsForm } from './features/products/components/containers/products-form/products-form';
import { Login } from './features/login/components/containers/login/login';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'products',
    component: ProductsList,
    canActivate: [authGuard],
  },
  {
    path: 'products/new',
    component: ProductsForm,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
  },
  {
    path: 'products/:id/edit',
    component: ProductsForm,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
  },
  {
    path: 'products/:id',
    component: ProductsDetails,
    canActivate: [authGuard],
  },
  {
    path: 'cart',
    component: ShoppingCartDetails,
    canActivate: [authGuard],
  },
];
