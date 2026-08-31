import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Check,
} from 'lucide-react';
import * as wishlistService from '../../services/wishlist.service';

export function WishlistList() {
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMoveToCart = async (item: any) => {
    setMovingId(item.product_id);
    try {
      const { addItem } = await import('../../services/cart.service');
      await addItem({ productId: item.product_id, quantity: 1 });
      await wishlistService.removeItem(item.product_id);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="loader" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading saved favorites...</p>
      </div>
    );
  }

  if (!wishlist || !wishlist.items || !wishlist.items.length) {
    return (
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 24,
          padding: '60px 24px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          margin: '20px 0',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
            color: 'var(--accent)',
          }}
        >
          <Heart size={30} />
        </div>
        <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', margin: '0 0 8px' }}>
          Your Wishlist is Empty
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
          Save your favorite styles while exploring so you can easily review and order them later.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Discover Trending Styles <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
          Saved Favorites ({wishlist.items.length})
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}
      >
        {wishlist.items.map((item: any) => {
          const price = Number(item.final_price || item.price || 0);
          const imageSrc = item.product_image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg';

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--panel)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image wrap */}
              <div style={{ position: 'relative', height: 220, background: 'var(--panel-soft)' }}>
                <Link to={`/products/${item.product_id}`} style={{ display: 'block', height: '100%' }}>
                  <img
                    src={imageSrc}
                    alt={item.product_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await wishlistService.removeItem(item.product_id);
                    await load();
                  }}
                  className="wishlist-btn active"
                  style={{ top: 12, right: 12 }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} color="#ef4444" />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <Link
                    to={`/products/${item.product_id}`}
                    style={{
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.98rem',
                      color: 'var(--primary)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    {item.product_name}
                  </Link>

                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 14 }}>
                    LKR {price.toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '10px' }}
                  onClick={() => handleMoveToCart(item)}
                  disabled={movingId === item.product_id}
                >
                  {movingId === item.product_id ? (
                    <>
                      <Check size={16} /> Moving to Bag...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} /> Move to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

