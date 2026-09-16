import api from './api';

export interface ReviewItem {
  id: string;
  userId?: string;
  productId?: string | null;
  productName?: string | null;
  rating: number;
  title?: string | null;
  reviewText?: string | null;
  comment?: string | null;
  feedbackType?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
  userName?: string;
  name?: string;
  userInitials?: string;
  avatar?: string;
  location?: string;
  itemPurchased?: string;
}

export const getProductReviews = async (productId: string): Promise<ReviewItem[]> => {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data?.data?.reviews ?? [];
};

export const getMyReview = async (productId: string): Promise<{ review: ReviewItem | null; hasPurchased: boolean }> => {
  const res = await api.get(`/reviews/product/${productId}/my-review`);
  return res.data?.data ?? { review: null, hasPurchased: false };
};

export const getFeaturedReviews = async (limit = 3): Promise<ReviewItem[]> => {
  const res = await api.get(`/reviews/featured?limit=${limit}`);
  return res.data?.data?.reviews ?? [];
};

export const submitReview = async (productId: string, payload: { rating: number; reviewText?: string; title?: string }) => {
  const res = await api.post(`/reviews/product/${productId}`, payload);
  return res.data;
};


