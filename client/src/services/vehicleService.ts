import api from './api';

export const vehicleService = {
  getAll: (params?: any) => api.get('/vehicles', { params }),
  getNearby: (lat: number, lng: number, radius?: number) => api.get('/vehicles/nearby', { params: { lat, lng, radius } }),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  uploadImages: (id: string, formData: FormData) => api.post(`/vehicles/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  toggleAvailability: (id: string) => api.put(`/vehicles/${id}/availability`),
};
