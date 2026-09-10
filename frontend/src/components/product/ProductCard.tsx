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
    <article className="product-card">
      <div className="product-card__image-wrap">
        <Link to={`/products/${product.id}`} className="product-card__image-link">
          <img
            src={product.image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg'}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
          />
        </Link>

        {product.discount ? (
          <span className="discount-badge">-{product.discount}%</span>
        ) : null}

        <button
          type="button"
          className={`wishlist-btn ${activeInWishlist ? 'active' : ''}`}
          aria-label={`Save ${product.name} to wishlist`}
          onClick={handleToggleWishlist}
          title={activeInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={activeInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card__content">
        <div className="product-card__meta">
          <span className="product-card__category">
            {product.category || 'Collection'}
          </span>
          <span className="rating" aria-label={`Rating ${product.rating || 4.8} out of 5`}>
            <Star size={13} fill="#f59e0b" stroke="none" />
            <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
          </span>
        </div>

        <Link to={`/products/${product.id}`} className="product-card__title-link">
          <h3 className="product-card__title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <div className="product-card__price-row">
          <span className="product-card__price">
            LKR {product.price.toLocaleString()}
          </span>
          {product.oldPrice ? (
            <span className="product-card__old-price">
              LKR {product.oldPrice.toLocaleString()}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="add-cart-btn"
          onClick={handleAddToCart}
          disabled={loadingCart}
          style={{
            background: activeInCart ? 'var(--accent-3)' : undefined,
          }}
        >
          {activeInCart ? (
            <>
              <Check size={16} /> In Bag
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
