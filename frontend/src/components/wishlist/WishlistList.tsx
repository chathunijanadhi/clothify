import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  ArrowRight,
  Check,
  Star,
  ShoppingBag,
} from 'lucide-react';
import * as wishlistService from '../../services/wishlist.service';
import * as cartService from '../../services/cart.service';
import { useAuth } from '../../services/auth.context';
import { useWishlist } from '../../services/wishlist.context';
import { useCart } from '../../services/cart.context';

export function WishlistList() {
  const { user, loading: authLoading } = useAuth();
  const { reload: reloadGlobalWishlist } = useWishlist();
  const { reload: reloadGlobalCart, isInCart } = useCart();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movingAll, setMovingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
      reloadGlobalWishlist();
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [authLoading, user]);

  const handleMoveToCart = async (item: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const productId = item.product_id;
    setMovingId(productId);
    try {
      await cartService.addItem({ productId, quantity: 1 });
      await wishlistService.removeItem(productId);
      // Optimistically update local wishlist items
      setWishlist((prev: any) => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.filter((i: any) => i.product_id !== productId),
        };
      });
      reloadGlobalCart();
      reloadGlobalWishlist();
    } catch (err) {
      console.error('Failed to move item to cart:', err);
      await load();
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!wishlist?.items || wishlist.items.length === 0 || movingAll) return;

    setMovingAll(true);
    try {
      for (const item of wishlist.items) {
        try {
          await cartService.addItem({ productId: item.product_id, quantity: 1 });
          await wishlistService.removeItem(item.product_id);
        } catch (itemErr) {
          console.error(`Failed to move item ${item.product_id}:`, itemErr);
        }
      }
      setWishlist((prev: any) => (prev ? { ...prev, items: [] } : prev));
      reloadGlobalCart();
      reloadGlobalWishlist();
    } catch (err) {
      console.error('Failed to move all items to cart:', err);
      await load();
    } finally {
      setMovingAll(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      // Optimistic removal
      setWishlist((prev: any) => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.filter((i: any) => i.product_id !== productId),
        };
      });
      await wishlistService.removeItem(productId);
      reloadGlobalWishlist();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      await load();
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="loader" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading saved pieces...</p>
      </div>
    );
  }

  const items = wishlist?.items || [];

  if (items.length === 0) {
    return (
      <div className="wishlist-empty-container">
        <div className="wishlist-empty-icon-box">
          <Heart size={32} />
        </div>
        <h3 className="wishlist-empty-title">
          Your Wishlist is Empty
        </h3>
        <p className="wishlist-empty-desc">
          Save your favorite styles while exploring so you can easily review and order them whenever you're ready.
        </p>
        <Link
          to="/products"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}
        >
          Discover Trending Drops <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Toolbar */}
      <div className="wishlist-header-bar">
        <div className="wishlist-header-title-group">
          <h2 className="wishlist-header-title">
            Saved Pieces
          </h2>
          <span className="wishlist-count-badge">
            {items.length} {items.length === 1 ? 'Piece' : 'Pieces'}
          </span>
        </div>

        <div className="wishlist-header-actions">
          <Link
            to="/products"
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Explore Shop <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={handleMoveAllToCart}
            disabled={movingAll || items.length === 0}
          >
            {movingAll ? (
              <>
                <span className="loader" style={{ width: 12, height: 12, borderWidth: 2 }} /> Moving All...
              </>
            ) : (
              <>
                <ShoppingBag size={14} /> Move All to Bag
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items Styled Like Shop All Product Cards */}
      <div className="wishlist-grid product-grid">
        {items.map((item: any) => {
          const finalPrice = Math.round(Number(item.final_price || item.price || 0));
          const originalPrice = Math.round(Number(item.price || 0));
          const discountVal = item.discount_percentage
            ? Math.round(Number(item.discount_percentage))
            : (originalPrice > finalPrice
              ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
              : 0);

          const ratingVal = item.rating ? Number(item.rating) : 4.8;
          const imageSrc =
            item.product_image ||
            'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg';

          const isMoving = movingId === item.product_id;
          const itemInCart = isInCart(item.product_id);

          return (
            <article
              key={item.id || item.product_id}
              className="monic-product-card wishlist-product-card"
            >
              {/* Image Box */}
              <div className="monic-product-img-box">
                <Link
                  to={`/products/${item.product_id}`}
                  className="monic-product-img-link"
                >
                  <img
                    src={imageSrc}
                    alt={item.product_name}
                    loading="lazy"
                  />
                </Link>

                {/* Badge: Discount or Category */}
                {discountVal > 0 ? (
                  <span className="monic-product-badge monic-badge-yellow">
                    -{discountVal}% OFF
                  </span>
                ) : item.category_name ? (
                  <span className="monic-product-badge monic-badge-green">
                    {item.category_name}
                  </span>
                ) : null}

                {/* Quick Remove from Wishlist button */}
                <button
                  type="button"
                  className="monic-fav-btn active"
                  aria-label={`Remove ${item.product_name} from wishlist`}
                  onClick={() => handleRemove(item.product_id)}
                  title="Remove from saved wishlist"
                >
                  <Heart size={15} fill="currentColor" />
                </button>
              </div>

              {/* Info Block */}
              <div className="monic-product-info">
                <div className="monic-product-meta-row">
                  <span className="monic-product-dept-tag">
                    {item.segment ? `${item.segment} · ` : ''}
                    {item.category_name || 'Apparel'}
                  </span>
                  <div className="monic-product-rating">
                    <Star size={12} fill="#F59E0B" stroke="none" />
                    <span>{ratingVal.toFixed(1)}</span>
                  </div>
                </div>

                <Link
                  to={`/products/${item.product_id}`}
                  className="monic-product-name"
                  title={item.product_name}
                >
                  {item.product_name}
                </Link>

                {/* Bottom Row: Price & Move to Bag Button */}
                <div className="monic-product-bottom">
                  <div className="monic-product-price-wrap">
                    <span className="monic-product-price">
                      LKR {finalPrice.toLocaleString()}
                    </span>
                    {originalPrice > finalPrice && (
                      <span className="monic-product-old-price">
                        LKR {originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="monic-product-btn"
                    onClick={() => handleMoveToCart(item)}
                    disabled={isMoving || movingAll}
                    style={{
                      background: itemInCart ? '#6B8E6B' : undefined,
                      color: itemInCart ? '#ffffff' : undefined,
                    }}
                    title="Move to shopping bag"
                  >
                    {isMoving ? (
                      <>
                        <span
                          className="loader"
                          style={{ width: 12, height: 12, borderWidth: 2 }}
                        />{' '}
                        Moving...
                      </>
                    ) : itemInCart ? (
                      <>
                        <Check size={13} /> In Bag
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={13} /> Move to Bag
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
