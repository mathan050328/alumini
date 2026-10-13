import api from './axiosConfig';

export const getStudentProfile = () => api.get('/students/profile');
export const getStudentProfileById = (id) => api.get(`/students/profile/${id}`);
export const updateStudentProfile = (data) => api.put('/students/profile', data);
export const addStudentSkills = (skills) => api.post('/students/profile/skills', { skills });
export const removeStudentSkill = (skillId) => api.delete(`/students/profile/skills/${skillId}`);
export const addStudentProject = (data) => api.post('/students/profile/projects', data);
export const removeStudentProject = (projectId) => api.delete(`/students/profile/projects/${projectId}`);
const buildFormData = (file) => {
  if (file instanceof FormData) return file;
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

export const uploadProfilePicture = (file) =>
  api.post('/students/profile/picture', buildFormData(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const uploadResume = (file) =>
  api.post('/students/profile/resume', buildFormData(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getStudentDashboard = () => api.get('/students/dashboard');

export const getRecommendedAlumni = (params = 6) => {
  const limit = typeof params === 'object' && params?.limit ? params.limit : params;
  return api.get(`/students/recommended-alumni?limit=${limit}`);
};
