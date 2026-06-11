import api from './api';

export const bookingService = {
  create: (data: any) => api.post('/bookings', data),
  getAll: (params?: any) => api.get('/bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
  confirm: (id: string) => api.put(`/bookings/${id}/confirm`),
  complete: (id: string) => api.put(`/bookings/${id}/complete`),
  getVehicleBookings: (vehicleId: string) => api.get(`/bookings/vehicle/${vehicleId}`),
  updatePaymentMethod: (id: string, paymentMethod: string) => api.put(`/bookings/${id}/payment-method`, { paymentMethod }),
  markAsPaid: (id: string) => api.put(`/bookings/${id}/mark-paid`),
  startRental: (id: string) => api.put(`/bookings/${id}/start-rental`),
};
