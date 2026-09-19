import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),      // ADD THIS
  changePassword: (data) => api.put('/auth/change-password', data)  // ADD THIS
};

export const expenseAPI = {
  getAllExpenses: (params) => api.get('/expenses', { params }),
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get('/expenses/stats')
};

export const receiptAPI = {
  uploadReceipt: (formData) => api.post('/receipts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllReceipts: () => api.get('/receipts'),
  getReceiptById: (id) => api.get(`/receipts/${id}`)
};

export const budgetAPI = {  // ADD THIS
  getBudgets: () => api.get('/budgets'),
  getBudgetById: (id) => api.get(`/budgets/${id}`),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
  checkAlerts: () => api.get('/budgets/alerts/check')
};

export default api;