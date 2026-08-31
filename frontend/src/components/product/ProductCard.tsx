import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { UIProduct } from '../../types/product.types';

export function ProductCard({ product }: { product: UIProduct }) {
  const [addedCart, setAddedCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loadingCart) return;
    setLoadingCart(true);
    try {
      const { addItem } = await import('../../services/cart.service');
      await addItem({ productId: product.id, quantity: 1 });
      setAddedCart(true);
      setTimeout(() => setAddedCart(false), 2200);
    } catch (err: unknown) {
      console.error(err);
      // Fallback
    } finally {
      setLoadingCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loadingWishlist) return;
    setLoadingWishlist(true);
    try {
      const { addItem, removeItem } = await import('../../services/wishlist.service');
      if (isWishlisted) {
        await removeItem(product.id);
        setIsWishlisted(false);
      } else {
        await addItem(product.id);
        setIsWishlisted(true);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <Link to={`/products/${product.id}`} style={{ display: 'block', height: '100%' }}>
          <img
            src={product.image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg'}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
          />
        </Link>

        {product.discount ? (
          <span className="discount-badge">-{product.discount}% OFF</span>
        ) : null}

        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label={`Save ${product.name} to wishlist`}
          onClick={handleToggleWishlist}
          title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card__content">
        <div className="product-card__meta">
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent)' }}>
            {product.category || 'Collection'}
          </span>
          <span className="rating" style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.8rem' }}>
            <Star size={13} fill="#f59e0b" stroke="none" /> {product.rating ? product.rating.toFixed(1) : '4.8'}
          </span>
        </div>

        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--primary)',
              margin: '6px 0 10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="product-card__price-row" style={{ marginBottom: 12 }}>
          <span className="product-card__price" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            LKR {product.price.toLocaleString()}
          </span>
          {product.oldPrice ? (
            <span className="product-card__old-price" style={{ fontSize: '0.86rem' }}>
              LKR {product.oldPrice.toLocaleString()}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="add-cart-btn"
          onClick={handleAddToCart}
          style={{
            background: addedCart ? 'var(--accent-3)' : undefined,
            transition: 'all 0.25s ease',
          }}
        >
          {addedCart ? (
            <>
              <Check size={16} /> Added to Bag
            </>
          ) : loadingCart ? (
            <>
              <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={15} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}

