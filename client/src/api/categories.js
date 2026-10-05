// Categories API for CampusFix
import { api } from './client';

export const categoriesApi = {
  getCategories: (all = false) => api.get(`/categories${all ? '?all=true' : ''}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.patch(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};
