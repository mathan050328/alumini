import api from './axiosConfig';

export const searchAlumni = (params) => api.get('/alumni', { params });
export const getAlumniById = (id) => api.get(`/alumni/${id}`);
export const getAlumniProfile = () => api.get('/alumni/profile');
export const updateAlumniProfile = (data) => api.put('/alumni/profile', data);
export const addAlumniSkills = (skills) => api.post('/alumni/profile/skills', { skills });
export const removeAlumniSkill = (skillId) => api.delete(`/alumni/profile/skills/${skillId}`);
export const addAlumniExperience = (data) => api.post('/alumni/profile/experience', data);
export const removeAlumniExperience = (expId) => api.delete(`/alumni/profile/experience/${expId}`);
export const uploadAlumniPicture = (formData) => api.post('/alumni/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleMentorshipStatus = (status) => api.patch('/alumni/profile/mentorship-status', { status });
