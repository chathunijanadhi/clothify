import api from './api';

export async function getWishlist() {
  const res = await api.get('/wishlist');
  return res.data.data.wishlist;
}

export async function addItem(productId: string) {
  const res = await api.post('/wishlist/items', { productId });
  return res.data.data.wishlist;
}

export async function removeItem(productId: string) {
  const res = await api.delete(`/wishlist/items/${productId}`);
  return res.data.data.wishlist;
}
