// Notification API for CampusFix
import { api } from './client';

export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.post('/notifications/read-all', {}),
};
