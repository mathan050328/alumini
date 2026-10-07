import api from './axiosConfig';

export const postJob = (data) => api.post('/jobs', data);
export const searchJobs = (params) => api.get('/jobs', { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const getMyPostedJobs = () => api.get('/jobs/my-posts');

// Applications
export const applyForJob = (data) => api.post('/applications', data);
export const getMyApplications = () => api.get('/applications/my');
export const getJobApplications = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, status) => api.patch(`/applications/${id}/status`, { status });

// Saved Jobs
export const saveJob = (jobId) => api.post(`/saved-jobs/${jobId}`);
export const unsaveJob = (jobId) => api.delete(`/saved-jobs/${jobId}`);
export const getSavedJobs = () => api.get('/saved-jobs');

// Referrals (convenience — also in referralApi)
export const requestReferral = (data) => api.post('/referrals', data);
