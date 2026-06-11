import api from './api';

export const reviewService = {
  create: (data: any) => api.post('/reviews', data),
  getVehicleReviews: (vehicleId: string) => api.get(`/reviews/vehicle/${vehicleId}`),
  getUserReviews: (userId: string) => api.get(`/reviews/user/${userId}`),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};
