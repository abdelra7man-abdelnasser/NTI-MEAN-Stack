import { Routes } from '@angular/router';
import { authGuard }  from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Thaghr Market - Premium Marketplace'
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Products | Thaghr Market'
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
    title: 'Product Details | Thaghr Market'
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
    title: 'Your Cart | Thaghr Market'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Sign In | Thaghr Market'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
    title: 'Checkout | Thaghr Market',
    canActivate: [authGuard]
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
    title: 'My Account | Thaghr Market',
    canActivate: [authGuard]
  },
  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin/products/admin-products').then((m) => m.AdminProducts),
    title: 'Manage Products | Admin',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/categories',
    loadComponent: () => import('./pages/admin/categories/admin-categories').then((m) => m.AdminCategories),
    title: 'Manage Categories | Admin',
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '' }
];
