import { Routes } from '@angular/router';
import { ProductsList } from './features/products/components/containers/products-list/products-list';
import { ProductsDetails } from './features/products/components/containers/products-details/products-details';
import { ShoppingCartDetails } from './features/shopping-cart/components/containers/shopping-cart-details/shopping-cart-details';
import { ProductsFormView } from './features/products/components/presentational/products-form-view/products-form-view';
import { ProductsForm } from './features/products/components/containers/products-form/products-form';

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
    path: 'products/new',
    component: ProductsForm,
  },
  {
    path: 'products/:id/edit',
    component: ProductsForm,
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
