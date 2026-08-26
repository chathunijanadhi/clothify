import api from './api';

export async function getCart() {
  const res = await api.get('/cart');
  return res.data.data.cart;
}

export async function addItem(payload: { productId: string; variantId?: string | null; quantity?: number }) {
  const res = await api.post('/cart/items', payload);
  return res.data.data.cart;
}

export async function updateItem(itemId: string, quantity: number) {
  const res = await api.patch(`/cart/items/${itemId}`, { quantity });
  return res.data.data.cart;
}

export async function removeItem(itemId: string) {
  const res = await api.delete(`/cart/items/${itemId}`);
  return res.data.data.cart;
}

export async function clearCart() {
  const res = await api.delete('/cart');
  return res.data.data.cart;
}
