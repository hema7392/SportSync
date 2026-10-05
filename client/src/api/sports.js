import { apiRequest } from './client';

export const sportsApi = {
  getAllSports: () => apiRequest('/sports'),

  getMyCreatedSports: () => apiRequest('/sports/created'),

  getSportById: (id) => apiRequest(`/sports/${id}`),

  createSport: (sportData) =>
    apiRequest('/sports', {
      method: 'POST',
      body: JSON.stringify(sportData),
    }),

  deleteSport: (id) =>
    apiRequest(`/sports/${id}`, {
      method: 'DELETE',
    }),
};
