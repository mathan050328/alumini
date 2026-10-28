import api from './axiosConfig';

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getUsers = (params) => api.get('/admin/users', { params });
export const suspendUser = (id) => api.patch(`/admin/users/${id}/suspend`);
export const activateUser = (id) => api.patch(`/admin/users/${id}/activate`);
export const resetUserPassword = (id) => api.patch(`/admin/users/${id}/reset-password`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getPendingAlumni = () => api.get('/admin/alumni/pending');
export const verifyAlumni = (id) => api.patch(`/admin/alumni/${id}/verify`);
export const rejectAlumni = (id) => api.patch(`/admin/alumni/${id}/reject`);
export const togglePostVisibility = (id) => api.patch(`/admin/posts/${id}/visibility`);
export const bulkImportUsers = (formData) => api.post('/admin/users/bulk-import', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const downloadUsersTemplate = () => api.get('/admin/users/template', { responseType: 'blob' });
