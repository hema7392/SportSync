// Issues and Workflows API for CampusFix
import { api } from './client';

export const issuesApi = {
  getIssues: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return api.get(`/issues${queryString ? `?${queryString}` : ''}`);
  },

  getIssueById: (id) => api.get(`/issues/${id}`),

  createIssue: (data) => api.post('/issues', data),

  updateIssue: (id, data) => api.patch(`/issues/${id}`, data),

  addComment: (id, data) => api.post(`/issues/${id}/comments`, data),

  reopenIssue: (id, reason) => api.post(`/issues/${id}/reopen`, { reason }),

  cancelIssue: (id, reason) => api.post(`/issues/${id}/cancel`, { reason }),

  closeIssue: (id) => api.post(`/issues/${id}/close`, {}),

  assignTechnician: (id, technicianId) => api.post(`/issues/${id}/assign`, { technicianId }),

  acceptAndStartWork: (id) => api.post(`/issues/${id}/start`, {}),

  resolveIssue: (id, resolutionNote) => api.post(`/issues/${id}/resolve`, { resolutionNote }),
};
