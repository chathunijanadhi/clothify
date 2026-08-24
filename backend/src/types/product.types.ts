export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: string; // NUMERIC stored as string by pg
  discount_percentage: string; // NUMERIC stored as string by pg
  final_price: string; // NUMERIC stored as string by pg
  stock_quantity: number;
  rating: string; // NUMERIC stored as string by pg
  review_count: number;
  is_active: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
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

// DTO for future create/update requests (validation will be added later)
export interface ProductCreateDTO {
  name: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  brand?: string;
  price: number;
  discountPercentage?: number;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  isActive?: boolean;
}

export interface ProductUpdateDTO extends Partial<ProductCreateDTO> {}
