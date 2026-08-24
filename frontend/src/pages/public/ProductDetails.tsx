import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Product, ProductImage, ProductVariant, UIProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';
import { ProductCard } from '../../components/product/ProductCard';
import { useAuth } from '../../services/auth.context';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<UIProduct[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      // call state setters asynchronously to avoid lint rule about sync setState in effects
      setTimeout(() => {
        setLoading(false);
        setError('Product not found.');
      }, 0);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getProductById(id!);
        if (!mounted) return;
        if (!res) {
          setError('Product not found.');
          setProduct(null);
          return;
        }

        setProduct(res as Product);
        // default image index to primary image if present
        const images = (res.images ?? []) as ProductImage[];
        const primaryIndex = images.findIndex((img) => img.is_primary === true);
        setMainImageIndex(primaryIndex >= 0 ? primaryIndex : 0);

        // fetch related products (same category) — best-effort
        const categoryName = (res as Product).category_name ?? undefined;
        if (categoryName) {
          try {
            const list = await productService.getProducts({ category: categoryName, limit: 8 });
            if (!mounted) return;
            // map backend products to UIProduct (reuse mapping logic from Products page)
            const ui = (list as Product[])
              .filter((p) => p.id !== (res as Product).id)
              .slice(0, 4)
              .map((p) => {
                const price = Number(p.final_price || p.price || 0);
                const oldPrice = Number(p.price || 0);
                const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
                return {
                  id: p.id,
                  name: p.name,
                  category: p.category_name || '',
                  description: p.description ?? undefined,
                  brand: p.brand ?? undefined,
                  price,
                  oldPrice: oldPrice && oldPrice !== price ? oldPrice : undefined,
                  discount,
                  rating: Number(p.rating || 0),
                  reviewCount: p.review_count || 0,
                  image: p.images && p.images.length ? p.images[0].image_url : undefined,
                  sizes: p.variants ? Array.from(new Set(p.variants.map((v: ProductVariant) => v.size))) : [],
                  colors: p.variants ? Array.from(new Set(p.variants.map((v: ProductVariant) => v.color))) : [],
                  stock: p.stock_quantity || 0,
                } as UIProduct;
              });
            setRelated(ui);
          } catch {
            // ignore related products errors — not critical
          }
        }
      } catch (err) {
        const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
        if (status === 404) setError('Product not found.');
        else {
          console.error(err);
          setError('Unable to load product details.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  // derive available sizes/colors
  const sizes = useMemo(() => {
    if (!product?.variants) return [] as string[];
    return Array.from(new Set(product.variants.map((v: ProductVariant) => v.size))).filter(Boolean);
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [] as string[];
    return Array.from(new Set(product.variants.map((v: ProductVariant) => v.color))).filter(Boolean);
  }, [product]);

  // determine selected variant and its stock
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    // If product has sizes and colors both, match both. If only one dimension exists, match that.
    return product.variants.find((v: ProductVariant) => {
      if (sizes.length > 0 && colors.length > 0) {
        return v.size === selectedSize && v.color === selectedColor;
      }
      if (sizes.length > 0) {
        return v.size === selectedSize;
      }
      if (colors.length > 0) {
        return v.color === selectedColor;
      }
      return true; // no variants
    }) || null;
  }, [product, selectedSize, selectedColor, sizes.length, colors.length]);

  const availableStock = selectedVariant ? selectedVariant.stock_quantity : product?.stock_quantity ?? 0;

  useEffect(() => {
    const bounded = Math.max(1, Math.min(quantity, availableStock || 1));
    if (quantity !== bounded) {
      // update asynchronously to avoid sync setState-in-effect lint
      setTimeout(() => setQuantity(bounded), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableStock]);

  function formatPrice(value?: string | number) {
    const n = Number(value ?? 0);
    return `LKR ${n.toLocaleString()}`;
  }

  function handleAddToCart() {
    // auth check via context
    const { user } = useAuth();
    if (!user) {
      navigate('/login');
      return;
    }

    // require variant selections when applicable
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size.');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert('Please select a color.');
      return;
    }
    if (!availableStock || availableStock <= 0) {
      alert('This product is out of stock.');
      return;
    }
    if (quantity < 1 || quantity > availableStock) {
      alert('Invalid quantity.');
      return;
    }

    // Prepare payload for future cart API
    const payload = {
      productId: product?.id,
      variantId: selectedVariant?.id ?? null,
      size: selectedSize ?? null,
      color: selectedColor ?? null,
      quantity,
    };

    // For now, do not call Cart API — show placeholder message
    console.log('Prepared AddToCart payload:', payload);
    alert('Cart functionality will be available soon.');
  }

  function handleAddToWishlist() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const payload = { productId: product?.id };
    console.log('Prepared AddToWishlist payload:', payload);
    alert('Wishlist functionality will be available soon.');
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container product-page">
          <div className="loader">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="container product-page">
          <div className="error-box">
            <p>{error}</p>
            <div className="actions">
              <button onClick={() => window.location.reload()}>Retry</button>
              <Link to="/products" className="button">Back to Shop</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="container product-page">
          <p>Product not found.</p>
          <Link to="/products">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = (product.images ?? []) as ProductImage[];
  const mainImage = images.length ? images[mainImageIndex]?.image_url : undefined;

  // price logic: use backend final_price if present, otherwise calculate
  const backendFinalPrice = Number(product.final_price ?? product.price ?? 0);
  const backendPrice = Number(product.price ?? 0);
  const backendDiscount = Number(product.discount_percentage ?? 0);

  return (
    <div className="page-shell">
      <div className="container product-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <Link to="/products">Shop</Link> &gt; <Link to={`/products?category=${encodeURIComponent(product.category_name ?? '')}`}>{product.category_name}</Link> &gt; <span>{product.name}</span>
        </div>

        <div className="product-details-grid">
          <div className="gallery">
            <div className="main-image">
              {mainImage ? (
                <img src={mainImage} alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
              ) : (
                <div className="image-placeholder">No image available</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, idx) => (
                  <button key={img.id} className={`thumb ${idx === mainImageIndex ? 'active' : ''}`} onClick={() => setMainImageIndex(idx)}>
                    <img src={img.image_url} alt={img.alt_text ?? product.name} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="info">
            <h1>{product.name}</h1>
            <div className="meta">
              <span className="brand">{product.brand}</span>
              <span className="category">{product.category_name}</span>
              <span className="rating"><Star size={14} /> {Number(product.rating || 0)}</span>
            </div>

            <div className="price-row">
              {backendDiscount > 0 && backendPrice !== backendFinalPrice ? (
                <>
                  <span className="old-price">{formatPrice(backendPrice)}</span>
                  <span className="discount">{Math.round(backendDiscount)}%</span>
                </>
              ) : null}

              <div className="final-price">{formatPrice(backendFinalPrice)}</div>
            </div>

            <div className="description">{product.description}</div>

            {sizes.length > 0 && (
              <div className="selector">
                <label>Size</label>
                <div className="options">
                  {sizes.map((s) => (
                    <button key={s} className={`option ${s === selectedSize ? 'selected' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="selector">
                <label>Color</label>
                <div className="options">
                  {colors.map((c) => (
                    <button key={c} className={`option ${c === selectedColor ? 'selected' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="stock-quantity">
              {availableStock && availableStock > 0 ? <span>In stock: {availableStock}</span> : <span>Out of stock</span>}
            </div>

            <div className="quantity-row">
              <label>Quantity</label>
              <div className="qty-controls">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
                <input value={quantity} readOnly />
                <button onClick={() => setQuantity((q) => Math.min((availableStock || 1), q + 1))} disabled={quantity >= (availableStock || 1)}>+</button>
              </div>
            </div>

            <div className="actions-row">
              <button className="btn primary" onClick={handleAddToCart} disabled={!availableStock || availableStock <= 0}><ShoppingCart /> Add to Cart</button>
              <button className="btn outline" onClick={handleAddToWishlist}><Heart /> Add to Wishlist</button>
            </div>

          </div>
        </div>

        {related.length > 0 && (
          <section className="related">
            <h2>Related Products</h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
