import axios from 'axios';


const API_BASE_URL = 'https://vyapar-erp-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Company APIs
export const companyAPI = {
  create: (data) => api.post('/companies', data),
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};





// Item APIs
export const itemAPI = {
  create: (data) => api.post('/items', data),
 getByCompany: () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
  update: (id, data) => api.put(`/items/${id}`, data),
  updateStock: (id, data) => api.put(`/items/${id}/stock`, data),
  delete: (id) => api.delete(`/items/${id}`),
  getLowStock: () => api.get('/items/low-stock'),
};

// Ledger APIs
// Ledger APIs
export const ledgerAPI = {
  create: (data) => api.post('/ledgers', data),
getByCompany: (group) => {
  const url = group ? `/ledgers?group=${group}` : `/ledgers`;
  return api.get(url);
},

  getAll: (group) => {
    const url = group ? `/ledgers?group=${group}` : '/ledgers';
    return api.get(url);
  },

  getById: (id) => api.get(`/ledgers/${id}`),
  update: (id, data) => api.put(`/ledgers/${id}`, data),
  updateBalance: (id, data) => api.put(`/ledgers/${id}/balance`, data),
  delete: (id) => api.delete(`/ledgers/${id}`),
  getGroups: () => api.get('/ledgers/groups'),
};


// Voucher APIs
// Voucher APIs
export const voucherAPI = {
  create: (data) => api.post('/vouchers', data),
  getByCompany: (companyId, params) => {
    let url = `/vouchers/company/${companyId}`;
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) url += `?${queryParams}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/vouchers/${id}`),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  updatePayment: (id, data) => api.put(`/vouchers/${id}/payment`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
  getSummary: (companyId) => api.get(`/vouchers/summary/${companyId}`),
};



// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/auth/users'),
  create: (data) => api.post('/auth/users', data),
  getById: (id) => api.get(`/auth/users/${id}`),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
  updateRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/auth/users/${id}`),
};

// Report APIs
export const reportAPI = {
  getTrialBalance: (startDate, endDate) => 
    api.get(`/reports/trial-balance${startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
  getProfitLoss: (startDate, endDate) => 
    api.get(`/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`),
  getBalanceSheet: (asOnDate) => 
    api.get(`/reports/balance-sheet?asOnDate=${asOnDate}`),
  getLedgerReport: (ledgerId, startDate, endDate) =>
    api.get(`/reports/ledger?ledgerId=${ledgerId}${startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : ''}`),
  getGSTR1: (month, year) =>
    api.get(`/reports/gstr1?month=${month}&year=${year}`)
};

export default api;