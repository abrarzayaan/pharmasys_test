import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// ── Pages (lazy imports) ─────────────────────────────────────────
import React, { lazy, Suspense } from 'react';
import PageLoader from '@/components/ui/PageLoader';

const HomePage             = lazy(() => import('@/pages/HomePage'));
const ProductListPage      = lazy(() => import('@/pages/ProductListPage'));
const VariantDetailPage    = lazy(() => import('@/pages/VariantDetailPage'));
const CartPage             = lazy(() => import('@/pages/CartPage'));
const WishlistPage         = lazy(() => import('@/pages/WishlistPage'));
const CheckoutPage         = lazy(() => import('@/pages/CheckoutPage'));
const OrderSuccessPage     = lazy(() => import('@/pages/OrderSuccessPage'));
const OrdersPage           = lazy(() => import('@/pages/OrdersPage'));
const OrderDetailPage      = lazy(() => import('@/pages/OrderDetailPage'));
const OrderTrackingPage    = lazy(() => import('@/pages/OrderTrackingPage'));
const ProfilePage          = lazy(() => import('@/pages/ProfilePage'));
const AddressesPage        = lazy(() => import('@/pages/AddressesPage'));
const LoginPage            = lazy(() => import('@/pages/LoginPage'));
const RegisterPage         = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage         = lazy(() => import('@/pages/NotFoundPage'));


const wrap = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // ── Auth routes (no layout) ────────────────────────────────────
  { path: '/login',    element: wrap(<LoginPage />) },
  { path: '/register', element: wrap(<RegisterPage />) },

  // ── Public routes (with layout) ───────────────────────────────
  {
    element: <Layout />,
    children: [
      { path: '/',           element: wrap(<HomePage />) },
      { path: '/products',   element: wrap(<ProductListPage />) },
      { path: '/variants/:id', element: wrap(<VariantDetailPage />) },
      { path: '/wishlist',   element: wrap(<WishlistPage />) },
      { path: '*',           element: wrap(<NotFoundPage />) },
    ],
  },

  // ── Protected routes (with layout + auth guard) ───────────────
  {
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart',                          element: wrap(<CartPage />) },
          { path: '/checkout',                      element: wrap(<CheckoutPage />) },
          { path: '/order-success/:orderId',        element: wrap(<OrderSuccessPage />) },
          { path: '/account/orders',                element: wrap(<OrdersPage />) },
          { path: '/account/orders/:id',            element: wrap(<OrderDetailPage />) },
          { path: '/account/orders/:id/tracking',   element: wrap(<OrderTrackingPage />) },
          { path: '/account/profile',               element: wrap(<ProfilePage />) },
          { path: '/account/addresses',             element: wrap(<AddressesPage />) },
        ],
      },
    ],
  },
]);
