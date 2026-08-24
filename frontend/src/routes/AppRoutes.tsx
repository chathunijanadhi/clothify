import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/public/Home';
import { Products } from '../pages/public/Products';
import { ProductDetails } from '../pages/public/ProductDetails';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
