import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/public/Home';
import { Products } from '../pages/public/Products';
import { ProductDetails } from '../pages/public/ProductDetails';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import {
  AdminCatalogPage,
  AdminCustomersPage,
  AdminDashboard,
  AdminOrdersPage,
  AdminPaymentsPage,
} from '../pages/admin/AdminDashboard';
import {
  CustomerCartPage,
  CustomerDashboard,
  CustomerOrdersPage,
  CustomerProfilePage,
  CustomerWishlistPage,
} from '../pages/customer/CustomerDashboard';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/catalog"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCatalogPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/cart"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerCartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/wishlist"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerWishlistPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
