import { Request, Response } from 'express';
import * as productService from '../services/product.service';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await productService.listCategories();
    return res.json({ success: true, message: 'Categories retrieved successfully', data: { categories } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load categories', error: error.message || 'SERVER_ERROR' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: normalizeString(req.query.search),
      category: normalizeString(req.query.category),
      brand: normalizeString(req.query.brand),
      minPrice: normalizeNumber(req.query.minPrice),
      maxPrice: normalizeNumber(req.query.maxPrice),
      size: normalizeString(req.query.size),
      color: normalizeString(req.query.color),
      rating: normalizeNumber(req.query.rating),
      inStock: normalizeBoolean(req.query.inStock),
      sort: normalizeString(req.query.sort) || 'newest',
    };

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));

    const [products, total] = await Promise.all([
      productService.getProducts(filters, page, limit),
            productService.countProducts(filters),
    ]);

    const productIds = products.map((product) => product.id);
    const [images, variants] = await Promise.all([
      productService.getProductImages(productIds),
            productService.getProductVariants(productIds),
    ]);

    const imageMap = new Map<string, any[]>();
        const variantMap = new Map<string, any[]>();

    images.forEach((image) => {
      const existing = imageMap.get(image.product_id) ?? [];
      existing.push(image);
      imageMap.set(image.product_id, existing);
    });

    variants.forEach((variant) => {
      const existing = variantMap.get(variant.product_id) ?? [];
      existing.push(variant);
      variantMap.set(variant.product_id, existing);
    });

    const hydratedProducts = products.map((product) => ({
      ...product,
      images: imageMap.get(product.id) ?? [],
      variants: variantMap.get(product.id) ?? [],
    }));

    return res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: hydratedProducts,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to retrieve products', error: error.message || 'SERVER_ERROR' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', error: 'PRODUCT_NOT_FOUND' });
    }

    const [images, variants] = await Promise.all([
      productService.getProductImages([product.id]),
            productService.getProductVariants([product.id]),
    ]);

    return res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product: {
          ...product,
          images,
          variants,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to retrieve product', error: error.message || 'SERVER_ERROR' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required', error: 'INVALID_PRODUCT_NAME' });
    }

    if (!body.price && body.price !== 0) {
      return res.status(400).json({ success: false, message: 'Product price is required', error: 'INVALID_PRICE' });
    }

    const productPayload = {
      id: body.id,
      name: body.name,
      description: body.description ?? null,
      categoryId: body.categoryId ?? null,
      categoryName: body.categoryName ?? null,
      brand: body.brand ?? null,
      price: Number(body.price),
      discountPercentage: Number(body.discountPercentage ?? 0),
      stockQuantity: Number(body.stockQuantity ?? 0),
      sizes: Array.isArray(body.sizes) ? body.sizes.map((item: unknown) => String(item)) : [],
      colors: Array.isArray(body.colors) ? body.colors.map((item: unknown) => String(item)) : [],
      images: Array.isArray(body.images) ? body.images.map((item: unknown) => String(item)) : [],
      isActive: body.isActive ?? true,
    };

    const created = await productService.createProduct(productPayload);
    return res.status(201).json({ success: true, message: 'Product created successfully', data: { product: created } });
  } catch (error: any) {
    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.status(400).json({ success: false, message: 'Category not found', error: 'CATEGORY_NOT_FOUND' });
    }
    return res.status(500).json({ success: false, message: 'Unable to create product', error: error.message || 'SERVER_ERROR' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    const product = await productService.updateProduct(id, {
      name: req.body.name,
      description: req.body.description,
      categoryId: req.body.categoryId,
      categoryName: req.body.categoryName,
      brand: req.body.brand,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      discountPercentage: req.body.discountPercentage !== undefined ? Number(req.body.discountPercentage) : undefined,
      stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : undefined,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes.map((item: unknown) => String(item)) : undefined,
      colors: Array.isArray(req.body.colors) ? req.body.colors.map((item: unknown) => String(item)) : undefined,
      images: Array.isArray(req.body.images) ? req.body.images.map((item: unknown) => String(item)) : undefined,
      isActive: req.body.isActive,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', error: 'PRODUCT_NOT_FOUND' });
    }

    return res.json({ success: true, message: 'Product updated successfully', data: { product } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to update product', error: error.message || 'SERVER_ERROR' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    const deleted = await productService.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found', error: 'PRODUCT_NOT_FOUND' });
    }

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to delete product', error: error.message || 'SERVER_ERROR' });
  }
};

function normalizeString(value: unknown): string | undefined {
  if (Array.isArray(value)) return String(value[0] ?? '').trim() || undefined;
  if (typeof value === 'string') return value.trim() || undefined;
  return undefined;
}

function normalizeNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const text = value.toLowerCase();
    if (text === 'true') return true;
    if (text === 'false') return false;
  }
  return undefined;
}
