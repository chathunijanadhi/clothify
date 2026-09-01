import api from './api';

export interface ReviewItem {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  reviewText: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userInitials: string;
}

export const getProductReviews = async (productId: string): Promise<ReviewItem[]> => {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data?.data?.reviews ?? [];
};

export const getMyReview = async (productId: string): Promise<{ review: any; hasPurchased: boolean }> => {
  const res = await api.get(`/reviews/product/${productId}/my-review`);
  return res.data?.data ?? { review: null, hasPurchased: false };
};

export const submitReview = async (productId: string, payload: { rating: number; reviewText?: string }) => {
  const res = await api.post(`/reviews/product/${productId}`, payload);
  return res.data;
};
