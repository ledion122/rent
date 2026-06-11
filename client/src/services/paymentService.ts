import api from './api';

export const paymentService = {
  createPaymentIntent: (bookingId: string) => api.post('/payments/create-payment-intent', { bookingId }),
  confirmPayment: (bookingId: string, paymentMethod: string) => api.post('/payments/confirm', { bookingId, paymentMethod }),
  getHistory: () => api.get('/payments/history'),
};
