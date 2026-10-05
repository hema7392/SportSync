// Reports API for CampusFix
import { api } from './client';

export const reportsApi = {
  getOverview: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString();
    return api.get(`/reports/overview${qs ? `?${qs}` : ''}`);
  },

  getCategories: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString();
    return api.get(`/reports/categories${qs ? `?${qs}` : ''}`);
  },

  getLocations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString();
    return api.get(`/reports/locations${qs ? `?${qs}` : ''}`);
  },

  getTechnicians: () => api.get('/reports/technicians'),

  getTrends: () => api.get('/reports/trends'),
};
