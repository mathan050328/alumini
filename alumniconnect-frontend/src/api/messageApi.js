import api from './axiosConfig';

export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (conversationId) => api.get(`/messages/conversations/${conversationId}`);
export const sendMessage = (conversationId, data) => api.post(`/messages/conversations/${conversationId}`, data);
export const startConversation = (recipientId) => api.post('/messages/conversations', { recipientId });
export const getUnreadMessageCount = () => api.get('/messages/unread-count');
