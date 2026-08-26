import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UIProduct } from '../../types/product.types';

export function ProductCard({ product }: { product: UIProduct }) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <Link to={`/products/${product.id}`}>
          <img src={product.image ?? ''} alt={product.name} className="product-card__image" />
        </Link>
        {product.discount ? <span className="discount-badge">-{product.discount}%</span> : null}
        <button className="wishlist-btn" aria-label={`Add ${product.name} to wishlist`} onClick={async () => {
          try {
            const { addItem } = await import('../../services/wishlist.service');
            await addItem(product.id);
            alert('Added to wishlist');
          } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || err?.message || 'Unable to add to wishlist');
          }
        }}>
          <Heart size={16} />
        </button>
      </div>
      <div className="product-card__content">
        <div className="product-card__meta">
          <span>{product.category}</span>
          <span className="rating">
            <Star size={14} fill="currentColor" /> {product.rating}
          </span>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card__price-row">
          <span className="product-card__price">LKR {product.price.toLocaleString()}</span>
          {product.oldPrice ? <span className="product-card__old-price">LKR {product.oldPrice.toLocaleString()}</span> : null}
        </div>
        <button className="add-cart-btn" onClick={async () => {
          try {
            const { addItem } = await import('../../services/cart.service');
            await addItem({ productId: product.id, quantity: 1 });
            alert('Added to cart');
          } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || err?.message || 'Unable to add to cart');
          }
        }}>
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </article>
  );
}
