import { apiRequest } from './client';

export const sessionsApi = {
  getAvailableSessions: (sportId) => {
    const query = sportId ? `?sportId=${sportId}` : '';
    return apiRequest(`/sessions${query}`);
  },

  getCreatedSessions: () => apiRequest('/sessions/created'),

  getJoinedSessions: () => apiRequest('/sessions/joined'),

  getSessionById: (id) => apiRequest(`/sessions/${id}`),

  createSession: (sessionData) =>
    apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  joinSession: (id, data = {}) =>
    apiRequest(`/sessions/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelSession: (id, reason) =>
    apiRequest(`/sessions/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
