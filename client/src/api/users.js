// User Management API for CampusFix
import { api } from './client';

export const usersApi = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.isActive !== undefined && params.isActive !== '') query.append('isActive', params.isActive);
    const queryString = query.toString();
    return api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },

  getTechnicians: () => api.get('/users/technicians'),

  getUserById: (id) => api.get(`/users/${id}`),

  updateUserStatus: (id, data) => api.patch(`/users/${id}/status`, data),
};
