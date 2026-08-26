import api from './api';

export const getMyOrders = async () => {
  const res = await api.get('/orders');
  return res.data?.data?.orders ?? [];
};

export const createOrder = async (payload: {
  paymentMethod: 'card' | 'bank_transfer';
  slipImage?: string | null;
  notes?: string | null;
  items?: Array<{ productId: string; quantity: number; variantId?: string | null; unitPrice?: number | string | null }>;
}) => {
  const res = await api.post('/orders', payload);
  return res.data?.data?.order ?? null;
};

export const getOrderDetails = async (id: string) => {
  const res = await api.get(`/orders/${id}`);
  return res.data?.data?.order ?? null;
};
