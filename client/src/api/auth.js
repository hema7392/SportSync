import { apiRequest } from './client';

export const authApi = {
  signup: (userData) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => apiRequest('/auth/me'),

  changePassword: (passwordData) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    }),
};
