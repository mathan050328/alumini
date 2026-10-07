import api from './axiosConfig';

export const requestMentorship = (data) => api.post('/mentorships', data);
export const getSentMentorships = () => api.get('/mentorships/sent');
export const getReceivedMentorships = () => api.get('/mentorships/received');
export const acceptMentorship = (id) => api.patch(`/mentorships/${id}/accept`);
export const rejectMentorship = (id) => api.patch(`/mentorships/${id}/reject`);
export const completeMentorship = (id) => api.patch(`/mentorships/${id}/complete`);
export const cancelMentorship = (id) => api.patch(`/mentorships/${id}/cancel`);
export const updateMentorshipStatus = (id, status) => api.patch(`/mentorships/${id}/${status.toLowerCase()}`);
