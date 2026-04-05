import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002') + '/api/',
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auth ──
export const login = (data) => api.post('auth/login', data);
export const createCompany = (data) => api.post('auth/create-company', data);
export const joinCompany = (data) => api.post('auth/join-company', data);

// ── Bills (Approval Workflow) ──
export const createBill = (data) => api.post('bills/create', data);
export const getMyBills = () => api.get('bills/my');
export const getAdminBills = () => api.get('bills/admin');
export const adminBillAction = (id, data) => api.patch(`bills/admin/${id}`, data);
export const getManagerBills = () => api.get('bills/manager');
export const managerBillAction = (id, data) => api.patch(`bills/manager/${id}`, data);

// ── OCR & Upload ──
export const uploadReceipt = (formData) => api.post('bills/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const scanReceipt = (receiptUrl) => api.post('bills/scan', { receiptUrl });

// ── Currency ──
export const convertCurrency = (from, amount, to = 'USD') => 
  api.get(`currency/convert?from=${from}&to=${to}&amount=${amount}`);

// ── Legacy Expenses ──
export const submitExpense = (data) => api.post('expenses/create', data);
export const getMyExpenses = () => api.get('expenses/my');
export const getPendingExpenses = () => api.get('expenses/pending');
export const approveExpense = (id) => api.put(`expenses/approve/${id}`);
export const rejectExpense = (id) => api.put(`expenses/reject/${id}`);

// ── Users Management ──
export const getUsers = () => api.get('users');
export const createUser = (data) => api.post('users', data);

export default api;
