// Types matching the backend API response (snake_case keys)
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku?: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  price: string; // numeric values are returned as strings by pg
  discount_percentage: string;
  final_price: string;
  stock_quantity: number;
  rating: string;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category_name?: string;
}

// UI-friendly DTO derived from backend Product (camelCase & typed)
export interface UIProduct {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  brand?: string | null;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image?: string;
  sizes: string[];
  colors: string[];
  stock: number;
}

