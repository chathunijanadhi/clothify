import api from './api';
import type { Product, Category } from '../types/product.types';

export const getProducts = async (params?: Record<string, unknown>): Promise<Product[]> => {
  const res = await api.get('/products', { params });
  // backend returns { success, data: { products, page, ... } }
  // product.controller returns data.products array
  return res.data?.data?.products ?? [];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const res = await api.get(`/products/${id}`);
  return res.data?.data?.product ?? null;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/products/categories');
  return res.data?.data?.categories ?? [];
};

export const createProduct = async (payload: Record<string, unknown>) => {
  const res = await api.post('/products', payload);
  return res.data;
};

export const updateProduct = async (id: string, payload: Record<string, unknown>) => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
