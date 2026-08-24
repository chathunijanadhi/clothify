import * as productModel from '../models/product.model';
import { ProductRow, CategoryRow, ProductImageRow, ProductVariantRow } from '../models/product.model';

// Thin service layer that delegates to the model/repository.
// Keeps controllers decoupled from data-layer details and is ready for
// business logic in the future.

export const listCategories = async (): Promise<CategoryRow[]> => {
  return productModel.listCategories();
};

export const getProducts = async (filters: Record<string, unknown>, page = 1, limit = 10): Promise<ProductRow[]> => {
  return productModel.listProducts(filters, page, limit);
};

export const countProducts = async (filters: Record<string, unknown>): Promise<number> => {
  return productModel.countProducts(filters);
};

export const getProductById = async (id: string): Promise<ProductRow | null> => {
  return productModel.getProductById(id);
};

export const getProductImages = async (productIds: string[]): Promise<ProductImageRow[]> => {
  return productModel.listProductImages(productIds);
};

export const getProductVariants = async (productIds: string[]): Promise<ProductVariantRow[]> => {
  return productModel.listProductVariants(productIds);
};

export const createProduct = async (payload: {
  name: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  brand?: string | null;
  price: number;
  discountPercentage?: number;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  isActive?: boolean;
}) => {
  return productModel.createProduct(payload);
};

export const updateProduct = async (id: string, payload: any) => {
  return productModel.updateProduct(id, payload);
};

export const deleteProduct = async (id: string) => {
  return productModel.deleteProduct(id);
};
