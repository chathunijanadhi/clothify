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

export const getAllReviews = async (params?: { rating?: number; isFeatured?: boolean; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.rating) query.append('rating', String(params.rating));
  if (params?.isFeatured !== undefined) query.append('isFeatured', String(params.isFeatured));
  if (params?.search) query.append('search', params.search);

  const res = await api.get(`/reviews/admin/all?${query.toString()}`);
  return res.data?.data?.reviews ?? [];
};

export const toggleFeaturedReview = async (reviewId: string, isFeatured: boolean) => {
  const res = await api.patch(`/reviews/admin/${reviewId}/featured`, { isFeatured });
  return res.data?.data?.review ?? null;
};

export const deleteReview = async (reviewId: string) => {
  const res = await api.delete(`/reviews/admin/${reviewId}`);
  return res.data;
};


