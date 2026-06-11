import api from './api';

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  verifyUser: (id: string) => api.put(`/admin/users/${id}/verify`),
  rejectUser: (id: string) => api.put(`/admin/users/${id}/reject`),
  getVehicles: () => api.get('/admin/vehicles'),
  approveVehicle: (id: string) => api.put(`/admin/vehicles/${id}/approve`),
  rejectVehicle: (id: string) => api.put(`/admin/vehicles/${id}/reject`),
  getBusinesses: () => api.get('/admin/businesses'),
  verifyBusiness: (id: string) => api.put(`/admin/businesses/${id}/verify`),
  getAnalytics: () => api.get('/admin/analytics'),
};
