import { useEffect, useState } from 'react';
import * as wishlistService from '../../services/wishlist.service';

export function WishlistList() {
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
      alert('Unable to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading wishlist…</div>;
  if (!wishlist || !wishlist.items || !wishlist.items.length) return <div>Your wishlist is empty.</div>;

  return (
    <div>
      <h3>My Wishlist</h3>
      <ul>
        {wishlist.items.map((item: any) => (
          <li key={item.id}>
            <div>{item.product_name}</div>
            <div>Price: LKR {Number(item.final_price || item.price || 0).toLocaleString()}</div>
            <div>
              <button onClick={async () => { await wishlistService.removeItem(item.product_id); await load(); }}>Remove</button>
              <button onClick={async () => { try { const { addItem } = await import('../../services/cart.service'); await addItem({ productId: item.product_id, quantity: 1 }); alert('Added to cart'); } catch (err) { console.error(err); alert('Unable to add to cart'); } }}>Add to cart</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
