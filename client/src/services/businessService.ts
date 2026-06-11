import api from './api';

export const businessService = {
  create: (data: any) => api.post('/businesses', data),
  getAll: () => api.get('/businesses'),
  getById: (id: string) => api.get(`/businesses/${id}`),
  update: (id: string, data: any) => api.put(`/businesses/${id}`, data),
  addEmployee: (id: string, data: any) => api.post(`/businesses/${id}/employees`, data),
  removeEmployee: (id: string, employeeId: string) => api.delete(`/businesses/${id}/employees/${employeeId}`),
  getAnalytics: (id: string) => api.get(`/businesses/${id}/analytics`),
};
