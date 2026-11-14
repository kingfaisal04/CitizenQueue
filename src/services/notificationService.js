/**
 * CitizenQueue - Notification Service Layer
 * 
 * Provides live integration with backend notification API:
 * - GET /notifications
 * - PATCH /notifications/:id/read
 * - POST /notifications/read-all
 */

import { apiClient } from './api/apiClient';

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (id) => {
    return await apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    return await apiClient.post('/notifications/read-all');
  }
};

export default notificationService;
