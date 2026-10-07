import api from './axiosConfig';

export const getStudentProfile = () => api.get('/students/profile');
export const getStudentProfileById = (id) => api.get(`/students/profile/${id}`);
export const updateStudentProfile = (data) => api.put('/students/profile', data);
export const addStudentSkills = (skills) => api.post('/students/profile/skills', { skills });
export const removeStudentSkill = (skillId) => api.delete(`/students/profile/skills/${skillId}`);
export const addStudentProject = (data) => api.post('/students/profile/projects', data);
export const removeStudentProject = (projectId) => api.delete(`/students/profile/projects/${projectId}`);
export const uploadProfilePicture = (formData) => api.post('/students/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadResume = (formData) => api.post('/students/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getStudentDashboard = () => api.get('/students/dashboard');
export const getRecommendedAlumni = (limit = 6) => api.get(`/students/recommended-alumni?limit=${limit}`);
