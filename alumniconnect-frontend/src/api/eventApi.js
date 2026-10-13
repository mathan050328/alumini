import api from './axiosConfig';

export const createEvent = (data) => api.post('/events', data);
export const getEvents = (params) => api.get('/events', { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const registerForEvent = (id) => api.post(`/events/${id}/register`);
export const cancelEventRegistration = (id) => api.delete(`/events/${id}/register`);
export const getMyRegistrations = () => api.get('/events/my-registrations');
