import api from './api';

export const getSummary = async () => {
  const res = await api.get('/admin/summary');
  return res.data?.data?.summary ?? null;
};

export const getCustomers = async () => {
  const res = await api.get('/admin/customers');
  return res.data?.data?.customers ?? [];
};

export const getOrders = async () => {
  const res = await api.get('/admin/orders');
  return res.data?.data?.orders ?? [];
};

export const getPayments = async () => {
  const res = await api.get('/admin/payments');
  return res.data?.data?.payments ?? [];
};

export const updatePaymentStatus = async (orderId: string, status: 'paid' | 'rejected', note?: string) => {
  const res = await api.patch(`/admin/orders/${orderId}/payment`, { status, note });
  return res.data?.data ?? null;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return res.data?.data ?? null;
};

