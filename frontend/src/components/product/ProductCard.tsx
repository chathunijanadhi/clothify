import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { UIProduct } from '../../types/product.types';
import { useAuth } from '../../services/auth.context';
import { useCart } from '../../services/cart.context';
import { useWishlist } from '../../services/wishlist.context';

export function ProductCard({ product }: { product: UIProduct }) {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [loadingCart, setLoadingCart] = useState(false);
  const [addedTemp, setAddedTemp] = useState(false);

  const activeInWishlist = isWishlisted(product.id);
  const activeInCart = isInCart(product.id) || addedTemp;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (loadingCart) return;
    setLoadingCart(true);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      setAddedTemp(true);
      setTimeout(() => setAddedTemp(false), 2400);
    } catch (err: unknown) {
      console.error('Failed to add to cart:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product.id);
    } catch (err: unknown) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  return (
    <article className="monic-product-card">
      <div className="monic-product-img-box">
        <Link to={`/products/${product.id}`} className="monic-product-img-link">
          <img
            src={product.image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg'}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {product.discount ? (
          <span className="monic-product-badge monic-badge-yellow">-{product.discount}% OFF</span>
        ) : product.category ? (
          <span className="monic-product-badge monic-badge-green">{product.category}</span>
        ) : null}

        <button
          type="button"
          className={`monic-fav-btn ${activeInWishlist ? 'active' : ''}`}
          aria-label={`Save ${product.name} to wishlist`}
          onClick={handleToggleWishlist}
          title={activeInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={15} fill={activeInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="monic-product-info">
        <div className="monic-product-meta-row">
          <span className="monic-product-dept-tag">
            {product.segment ? `${product.segment} · ` : ''}{product.category || 'Apparel'}
          </span>
          <div className="monic-product-rating">
            <Star size={12} fill="#F59E0B" stroke="none" />
            <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`} className="monic-product-name" title={product.name}>
          {product.name}
        </Link>

        <div className="monic-product-bottom">
          <div className="monic-product-price-wrap">
            <span className="monic-product-price">
              LKR {product.price.toLocaleString()}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="monic-product-old-price">
                LKR {product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            className="monic-product-btn"
            onClick={handleAddToCart}
            disabled={loadingCart}
            style={{
              background: activeInCart ? '#6B8E6B' : undefined,
              color: activeInCart ? '#ffffff' : undefined,
            }}
          >
            {activeInCart ? (
              <>
                <Check size={13} /> In Bag
              </>
            ) : loadingCart ? (
              <>
                <span className="loader" style={{ width: 12, height: 12, borderWidth: 2 }} />
              </>
            ) : (
              <>
                <ShoppingCart size={13} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
