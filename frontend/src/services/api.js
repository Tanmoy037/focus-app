import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://focus-app-iw3c.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/api/users/register', data);
export const login = (data) => {
  const formData = new URLSearchParams();
  formData.append('username', data.email);
  formData.append('password', data.password);
  return api.post('/api/users/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};
export const getCurrentUser = () => api.get('/api/users/me');

// Goals
export const getGoals = (params) => api.get('/api/goals/', { params });
export const createGoal = (data) => api.post('/api/goals/', data);
export const updateGoal = (id, data) => api.put(`/api/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/api/goals/${id}`);

// Todos
export const getTodos = (params) => api.get('/api/todos/', { params });
export const createTodo = (data) => api.post('/api/todos/', data);
export const updateTodo = (id, data) => api.put(`/api/todos/${id}`, data);
export const deleteTodo = (id) => api.delete(`/api/todos/${id}`);

// Activities
export const getActivities = (params) => api.get('/api/activities/', { params });
export const createActivity = (data) => api.post('/api/activities/', data);
export const getActivityStats = (days = 7) => 
  api.get('/api/activities/stats/summary', { params: { days } });

// Boost (Videos)
export const getRecommendations = (maxResults = 5) => 
  api.get('/api/boost/recommendations', { params: { max_results: maxResults } });
export const getGoalVideos = (goalId, maxResults = 5) => 
  api.get(`/api/boost/goal/${goalId}/videos`, { params: { max_results: maxResults } });
export const searchVideos = (query, maxResults = 10) => 
  api.get('/api/boost/search', { params: { query, max_results: maxResults } });

// Music (Focus Music)
export const getMusicPlaylists = () => api.get('/api/music/playlists');
export const getPlaylist = (playlistId) => api.get(`/api/music/playlists/${playlistId}`);
export const getRecommendedMusic = () => api.get('/api/music/recommended');

export default api;

