import api from './api';

export const uploadImage = async (dataUrl: string) => {
  const res = await api.post('/uploads', { image: dataUrl });
  return res.data?.data?.url ?? null;
};
