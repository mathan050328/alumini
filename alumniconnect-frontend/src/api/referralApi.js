import api from './axiosConfig';

export const requestReferral = (data) => api.post('/referrals', data);
export const getSentReferrals = () => api.get('/referrals/sent');
export const getReceivedReferrals = () => api.get('/referrals/received');
export const acceptReferral = (id) => api.patch(`/referrals/${id}/accept`);
export const rejectReferral = (id) => api.patch(`/referrals/${id}/reject`);
export const completeReferral = (id) => api.patch(`/referrals/${id}/complete`);
