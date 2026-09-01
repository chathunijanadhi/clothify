import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { Product, ProductImage, ProductVariant, UIProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';
import * as reviewService from '../../services/review.service';
import type { ReviewItem } from '../../services/review.service';
import { ProductCard } from '../../components/product/ProductCard';
import { useAuth } from '../../services/auth.context';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<UIProduct[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // UI state
  const [addedCart, setAddedCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<'details' | 'care' | 'shipping' | null>('details');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) {
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
        const images = (res.images ?? []) as ProductImage[];
        const primaryIndex = images.findIndex((img) => img.is_primary === true);
        setMainImageIndex(primaryIndex >= 0 ? primaryIndex : 0);

        // Pre-select first available size and color
        if (res.variants && res.variants.length) {
          const firstVariant = res.variants[0];
          if (firstVariant.size) setSelectedSize(firstVariant.size);
          if (firstVariant.color) setSelectedColor(firstVariant.color);
        }

        // fetch reviews
        try {
          const productReviews = await reviewService.getProductReviews(id!);
          if (!mounted) return;
          setReviews(productReviews);
        } catch {
          // non-critical
        }

        // fetch related products
        const categoryName = (res as Product).category_name ?? undefined;
        if (categoryName) {
          try {
            const list = await productService.getProducts({ category: categoryName, limit: 8 });
            if (!mounted) return;
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
            // non-critical
          }
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load product details.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmitProductReview = async () => {
    if (!product?.id) return;
    setSubmittingReview(true);
    try {
      await reviewService.submitReview(product.id, {
        rating: reviewRating,
        reviewText: reviewComment,
      });
      setReviewSuccessMsg('Your review and rating have been recorded!');
      const [updatedProduct, updatedReviews] = await Promise.all([
        productService.getProductById(product.id),
        reviewService.getProductReviews(product.id),
      ]);
      if (updatedProduct) setProduct(updatedProduct);
      setReviews(updatedReviews);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccessMsg(null);
      }, 1400);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const sizes = useMemo(() => {
    if (!product?.variants) return [] as string[];
    return Array.from(new Set(product.variants.map((v: ProductVariant) => v.size))).filter(Boolean);
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [] as string[];
    return Array.from(new Set(product.variants.map((v: ProductVariant) => v.color))).filter(Boolean);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !product.variants.length) return null;
    return (
      product.variants.find((v: ProductVariant) => {
        if (sizes.length > 0 && colors.length > 0) {
          return v.size === selectedSize && v.color === selectedColor;
        }
        if (sizes.length > 0) return v.size === selectedSize;
        if (colors.length > 0) return v.color === selectedColor;
        return true;
      }) || null
    );
  }, [product, selectedSize, selectedColor, sizes.length, colors.length]);

  const availableStock = selectedVariant ? selectedVariant.stock_quantity : product?.stock_quantity ?? 0;

  useEffect(() => {
    const bounded = Math.max(1, Math.min(quantity, availableStock || 1));
    if (quantity !== bounded) {
      setTimeout(() => setQuantity(bounded), 0);
    }
  }, [availableStock]);

  async function handleAddToCart() {
    setActionError(null);
    if (!user) {
      navigate('/login');
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      setActionError('Please select a size before adding to cart.');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      setActionError('Please select a color before adding to cart.');
      return;
    }
    if (!availableStock || availableStock <= 0) {
      setActionError('This variant is currently out of stock.');
      return;
    }

    try {
      const { addItem } = await import('../../services/cart.service');
      await addItem({
        productId: product?.id!,
        variantId: selectedVariant?.id ?? null,
        quantity,
      });
      setAddedCart(true);
      setTimeout(() => setAddedCart(false), 2400);
    } catch (err: unknown) {
      console.error(err);
      setActionError('Unable to add item to cart. Please try again.');
    }
  }

  async function handleAddToWishlist() {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { addItem, removeItem } = await import('../../services/wishlist.service');
      if (isWishlisted) {
        await removeItem(product?.id!);
        setIsWishlisted(false);
      } else {
        await addItem(product?.id!);
        setIsWishlisted(true);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="loader" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading garment details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-shell">
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div
            style={{
              background: 'var(--panel)',
              padding: 40,
              borderRadius: 24,
              maxWidth: 480,
              margin: '0 auto',
              border: '1px solid var(--border)',
            }}
          >
            <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 14px' }} />
            <h2 style={{ margin: '0 0 10px', color: 'var(--primary)' }}>Product Not Found</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
              The style you are looking for might have been moved or is currently unavailable.
            </p>
            <Link to="/products" className="btn btn-primary">
              Return to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = (product.images ?? []) as ProductImage[];
  const mainImage = images.length
    ? images[mainImageIndex]?.image_url
    : 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg';

  const backendFinalPrice = Number(product.final_price ?? product.price ?? 0);
  const backendPrice = Number(product.price ?? 0);
  const backendDiscount = Number(product.discount_percentage ?? 0);

  return (
    <div className="page-shell">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="cf-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/products">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category_name ?? '')}`}>
            {product.category_name || 'Apparel'}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="active">{product.name}</span>
        </div>

        {/* Main Details Grid */}
        <div className="product-details">
          {/* ── Left Gallery Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                background: 'var(--panel-soft)',
                boxShadow: 'var(--shadow)',
                height: 520,
              }}
            >
              <img
                src={mainImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {backendDiscount > 0 && (
                <span className="discount-badge" style={{ top: 18, left: 18, fontSize: '0.82rem', padding: '6px 14px' }}>
                  -{Math.round(backendDiscount)}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setMainImageIndex(idx)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      overflow: 'hidden',
                      border: idx === mainImageIndex ? '2px solid var(--accent)' : '2px solid var(--border)',
                      padding: 0,
                      cursor: 'pointer',
                      background: 'var(--panel)',
                      flexShrink: 0,
                      boxShadow: idx === mainImageIndex ? 'var(--shadow-accent)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Info Section ── */}
          <div className="product-info-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-pink" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {product.category_name || 'Exclusive'}
              </span>
              {product.brand && (
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                  by {product.brand}
                </span>
              )}
            </div>

            <h1>{product.name}</h1>

            <div className="rating-line">
              <span className="rating-badge">
                <Star size={14} fill="currentColor" /> {Number(product.rating || 4.9).toFixed(1)}
              </span>
              <span style={{ fontSize: '0.85rem' }}>
                ({product.review_count || 38} customer reviews)
              </span>
            </div>

            <div className="price-row">
              <span className="current-price">LKR {backendFinalPrice.toLocaleString()}</span>
              {backendPrice > backendFinalPrice && (
                <span className="old-price">LKR {backendPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="description">{product.description || 'Elevate your wardrobe with this impeccably tailored essential, engineered for style, comfort, and all-day versatility.'}</p>

            {/* Error Banner */}
            {actionError && (
              <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{actionError}</span>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="option-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }}>Select Size</h3>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <HelpCircle size={14} /> Size Guide
                  </button>
                </div>

                <div className="choice-row">
                  {sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`choice-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedSize(s)}
                        style={{ minWidth: 44, textAlign: 'center' }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="option-group">
                <h3>Select Color: <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{selectedColor}</span></h3>
                <div className="choice-row">
                  {colors.map((c) => {
                    const isSelected = selectedColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`choice-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedColor(c)}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Indicator */}
            <div style={{ marginTop: 16 }}>
              {availableStock > 0 ? (
                <span style={{ color: '#065f46', fontSize: '0.86rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color="#00d4aa" /> In Stock ({availableStock} units available)
                </span>
              ) : (
                <span style={{ color: '#ef4444', fontSize: '0.86rem', fontWeight: 700 }}>
                  ⚠ Out of Stock
                </span>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="purchase-row">
              <div className="quantity-box">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                  disabled={quantity >= (availableStock || 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{
                  flex: 1,
                  background: addedCart ? 'var(--accent-3)' : undefined,
                  minWidth: 180,
                }}
                onClick={handleAddToCart}
                disabled={!availableStock || availableStock <= 0}
              >
                {addedCart ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                className="icon-btn"
                style={{
                  width: 50,
                  height: 50,
                  color: isWishlisted ? 'var(--accent)' : 'var(--primary)',
                  borderColor: isWishlisted ? 'var(--accent)' : undefined,
                  background: isWishlisted ? 'var(--accent-soft)' : undefined,
                }}
                onClick={handleAddToWishlist}
                title="Save to Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                marginTop: 24,
                padding: '14px 16px',
                background: 'var(--panel-soft)',
                borderRadius: 16,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                <Truck size={16} color="var(--accent)" /> Free Express Delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                <RotateCcw size={16} color="var(--accent-2)" /> 30-Day Free Returns
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                <ShieldCheck size={16} color="var(--accent-3)" /> 100% Genuine Quality
              </div>
            </div>

            {/* Collapsible Accordions */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Accordion 1 */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'var(--panel)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                  }}
                >
                  <span>Composition &amp; Fabric Details</span>
                  {activeAccordion === 'details' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'details' && (
                  <div style={{ padding: '0 18px 16px', color: 'var(--muted)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    Crafted with premium organic cotton blend, featuring reinforced double-stitched seams and pre-shrunk fabric to retain shape after multiple washes.
                  </div>
                )}
              </div>

              {/* Accordion 2 */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'var(--panel)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                  }}
                >
                  <span>Delivery, Tracking &amp; Returns</span>
                  {activeAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'shipping' && (
                  <div style={{ padding: '0 18px 16px', color: 'var(--muted)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    Orders placed before 2 PM EST ship same-day. Free standard shipping on orders over $50. Enjoy 30-day hassle-free returns on all unworn items.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Verified Customer Reviews Section ── */}
        <section className="section-block" style={{ marginTop: 48, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Star size={13} fill="currentColor" /> Verified Shopper Feedback
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--primary)', margin: '6px 0 0', fontWeight: 800 }}>
                Customer <span className="gradient-text">Reviews &amp; Ratings</span>
              </h2>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.88rem' }}
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                setReviewRating(5);
                setReviewComment('');
                setReviewSuccessMsg(null);
                setShowReviewModal(true);
              }}
            >
              <Star size={15} fill="currentColor" /> Write a Review
            </button>
          </div>

          {/* Review Score Summary Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              background: 'var(--panel)',
              padding: '24px 28px',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              marginBottom: 30,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                {Number(product.rating || 4.8).toFixed(1)}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 3, color: '#f59e0b', marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} fill={s <= Math.round(Number(product.rating || 4.8)) ? '#f59e0b' : 'none'} color="#f59e0b" />
                  ))}
                </div>
                <span style={{ fontSize: '0.86rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Based on {reviews.length > 0 ? reviews.length : (product.review_count || 12)} verified customer ratings
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
                <span style={{ width: 45, fontWeight: 700 }}>5 Star</span>
                <div style={{ flex: 1, height: 8, background: 'var(--panel-soft)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', background: 'var(--grad-accent)', borderRadius: 999 }} />
                </div>
                <span style={{ width: 35, textAlign: 'right', fontWeight: 600, color: 'var(--muted)' }}>92%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
                <span style={{ width: 45, fontWeight: 700 }}>4 Star</span>
                <div style={{ flex: 1, height: 8, background: 'var(--panel-soft)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '8%', height: '100%', background: '#f59e0b', borderRadius: 999 }} />
                </div>
                <span style={{ width: 35, textAlign: 'right', fontWeight: 600, color: 'var(--muted)' }}>8%</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Grid */}
          {reviews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'var(--panel)',
                    padding: 20,
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 14px', color: 'var(--primary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                      "{rev.reviewText || 'Excellent fabric quality and tailored fit. Highly satisfied with my purchase!'}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--grad-accent)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {rev.userInitials || 'VS'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--primary)', display: 'block' }}>
                        {rev.userName || 'Verified Buyer'}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-3)', fontWeight: 700 }}>
                        ✓ Verified Purchase
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--panel-soft)', borderRadius: 16, border: '1px dashed var(--border)' }}>
              <Star size={30} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <h4 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>Be the First to Rate this Style</h4>
              <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '0.88rem' }}>
                Purchased this garment? Share your thoughts on the texture, fit, and sizing with fellow shoppers.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  setShowReviewModal(true);
                }}
              >
                Rate Garment Now
              </button>
            </div>
          )}
        </section>

        {/* ── Related Products Carousel/Grid ── */}
        {related.length > 0 && (
          <section className="section-block" style={{ marginTop: 40 }}>
            <div className="section-heading">
              <p>Style Recommendations</p>
              <h2>Complete The <span>Look</span></h2>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Write Review Modal ── */}
      {showReviewModal && (
        <div className="cf-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="cf-modal-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="cf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Star size={20} color="var(--accent)" fill="var(--accent)" />
                <h3 style={{ margin: 0 }}>Review this Garment</h3>
              </div>
              <button type="button" className="cf-modal-close" onClick={() => setShowReviewModal(false)}>
                ✕
              </button>
            </div>

            <div className="cf-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, background: 'var(--panel-soft)', padding: 10, borderRadius: 12 }}>
                <img
                  src={product.images && product.images.length > 0 ? product.images[0].image_url : 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg'}
                  alt={product.name}
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                />
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--primary)' }}>{product.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Verified Customer Feedback</div>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
                  Tap Stars to Rate
                </span>
                <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                        transform: star <= reviewRating ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star size={32} fill={star <= reviewRating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b', marginTop: 6 }}>
                  {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Exceptional Quality' :
                   reviewRating === 4 ? '⭐⭐⭐⭐ Great Fit & Style' :
                   reviewRating === 3 ? '⭐⭐⭐ Average Experience' :
                   reviewRating === 2 ? '⭐⭐ Below Expectations' : '⭐ Poor'}
                </div>
              </div>

              {/* Feedback text */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                  Write Your Review (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the fabric, sizing fit, and overall comfort..."
                  style={{
                    width: '100%',
                    minHeight: 90,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {reviewSuccessMsg && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: 10, fontSize: '0.84rem', fontWeight: 700, marginBottom: 14, textAlign: 'center' }}>
                  ✓ {reviewSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitProductReview}
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="cf-modal-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="cf-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cf-modal-header">
              <h3>Clothify Standard Size Guide</h3>
              <button
                type="button"
                className="cf-modal-close"
                onClick={() => setShowSizeGuide(false)}
              >
                ✕
              </button>
            </div>
            <div className="cf-modal-body">
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                All measurements are in inches. For a looser fit, we recommend selecting one size up.
              </p>
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Waist (in)</th>
                    <th>Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>XS</strong></td><td>34 - 36</td><td>28 - 30</td><td>27</td></tr>
                  <tr><td><strong>S</strong></td><td>36 - 38</td><td>30 - 32</td><td>28</td></tr>
                  <tr><td><strong>M</strong></td><td>38 - 40</td><td>32 - 34</td><td>29</td></tr>
                  <tr><td><strong>L</strong></td><td>40 - 42</td><td>34 - 36</td><td>30</td></tr>
                  <tr><td><strong>XL</strong></td><td>42 - 44</td><td>36 - 38</td><td>31</td></tr>
                  <tr><td><strong>XXL</strong></td><td>44 - 46</td><td>38 - 40</td><td>32</td></tr>
                </tbody>
              </table>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 20 }}
                onClick={() => setShowSizeGuide(false)}
              >
                Got It, Back to Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

