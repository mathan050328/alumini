import api from './axiosConfig';

export const getCurrentUser = () => api.get('/users/me');

export const uploadProfilePicture = (formData) => api.post('/users/profile-picture', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const setProfilePictureUrl = (url) => api.post('/users/profile-picture-url', { url });
