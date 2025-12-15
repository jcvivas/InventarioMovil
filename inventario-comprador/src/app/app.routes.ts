import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },

  {
    path: 'tabs',
    canMatch: [authGuard],
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: 'products', loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage) },
      { path: 'wishlist', loadComponent: () => import('./pages/wishlist/wishlist.page').then(m => m.WishlistPage) },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage) },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },

  { path: 'product/:id', canMatch: [authGuard], loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage) },

  { path: '**', redirectTo: 'tabs' },
];
    