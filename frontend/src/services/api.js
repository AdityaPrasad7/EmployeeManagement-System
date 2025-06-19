import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '../config/constants';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url, response.status);
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return '/login';
  },
};

// Employee services
export const employeeService = {
  getProfile: () => api.get('/auth/me'),
  getLeaveBalance: () => api.get('/leave/balance'),
  getLeaveRequests: () => api.get('/leave'),
  createLeaveRequest: (data) => api.post('/leave', data),
  updateLeaveRequestStatus: (id, status) => api.put(`/leave/${id}/status`, { status })
};

// HR services
export const hrService = {
  getAllEmployees: () => api.get('/hr/employees'),
  createEmployee: (data) => api.post('/hr/employees', data),
  updateEmployee: (id, data) => api.put(`/hr/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/hr/employees/${id}`),
  getLeaveRequests: () => api.get('/hr/leaverequest'),
  updateLeaveRequestStatus: (id, status) => api.put(`/hr/leaverequest/${id}/status`, { status }),
  getAllCategories: () => api.get('/categories'),
  getMainCategories: () => api.get('/categories/main'),
  getInternCategories: () => api.get('/categories/intern'),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export default api; 