import api from './axiosConfig';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const checkEmailAvailability = (email) => api.get('/auth/check-email', { params: { email } });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const sendVerificationOtp = (email) => api.post('/auth/send-verification-otp', { email });
export const verifyEmailOtp = (email, code) => api.post('/auth/verify-email', { email, code });
