import { Routes } from '@angular/router';
import { ProductsList } from './features/products/components/containers/products-list/products-list';
import { ProductsDetails } from './features/products/components/containers/products-details/products-details';
import { ShoppingCartDetails } from './features/shopping-cart/components/containers/shopping-cart-details/shopping-cart-details';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    component: ProductsList,
  },
  {
    path: 'products/:id',
    component: ProductsDetails,
  },
  {
    path: 'cart',
    component: ShoppingCartDetails,
  },
];
