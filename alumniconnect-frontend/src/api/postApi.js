import api from './axiosConfig';

export const createPost = (data) => api.post('/posts', data);
export const getPosts = (params) => api.get('/posts', { params });
export const getPostById = (id) => api.get(`/posts/${id}`);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const unlikePost = (id) => api.post(`/posts/${id}/like`); // backend uses toggle
export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId, data) => api.post(`/posts/${postId}/comments`, data);
export const deleteComment = (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`);

