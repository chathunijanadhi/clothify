import { useEffect, useState } from 'react';
import * as cartService from '../../services/cart.service';

export function CartList() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
      alert('Unable to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading cart…</div>;
  if (!cart || !cart.items || !cart.items.length) return <div>Your cart is empty.</div>;

  return (
    <div>
      <h3>My Cart</h3>
      <ul>
        {cart.items.map((item: any) => (
          <li key={item.id}>
            <div>{item.product_name}</div>
            <div>Qty: {item.quantity}</div>
            <div>Price: LKR {Number(item.price_at_time || 0).toLocaleString()}</div>
            <div>
              <button onClick={async () => { await cartService.updateItem(item.id, Math.max(1, item.quantity - 1)); await load(); }}>-</button>
              <button onClick={async () => { await cartService.updateItem(item.id, item.quantity + 1); await load(); }}>+</button>
              <button onClick={async () => { await cartService.removeItem(item.id); await load(); }}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div>Subtotal: LKR {Number(cart.subtotal || 0).toLocaleString()}</div>
      <div>
        <button onClick={async () => { await cartService.clearCart(); await load(); }}>Clear Cart</button>
      </div>
    </div>
  );
}
