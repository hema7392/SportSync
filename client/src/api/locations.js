// Buildings and Locations API for CampusFix
import { api } from './client';

export const locationsApi = {
  getBuildings: (all = false) => api.get(`/buildings${all ? '?all=true' : ''}`),
  createBuilding: (data) => api.post('/buildings', data),
  updateBuilding: (id, data) => api.patch(`/buildings/${id}`, data),

  getLocations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.buildingId) query.append('buildingId', params.buildingId);
    if (params.all) query.append('all', 'true');
    const queryString = query.toString();
    return api.get(`/locations${queryString ? `?${queryString}` : ''}`);
  },
  createLocation: (data) => api.post('/locations', data),
  updateLocation: (id, data) => api.patch(`/locations/${id}`, data),
};
