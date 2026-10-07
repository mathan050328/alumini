import api from './axiosConfig';

export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.patch('/notifications/read-all');
export const markAllAsRead = () => api.patch('/notifications/read-all');
