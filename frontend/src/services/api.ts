import axios, { AxiosResponse } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://22njky-5000.csb.app/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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

// API response interface
interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data: T;
}

// Auth API
export const authAPI = {
  login: (credentials: { login: string; password: string }): Promise<AxiosResponse<ApiResponse<{ user: any; token: string }>>> =>
    api.post('/auth/login', credentials),

  register: (userData: any): Promise<AxiosResponse<ApiResponse<{ user: any; token: string }>>> =>
    api.post('/auth/register', userData),

  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<{ user: any }>>> =>
    api.get('/auth/me'),

  updateProfile: (userData: any): Promise<AxiosResponse<ApiResponse<{ user: any }>>> =>
    api.put('/auth/profile', userData),

  changePassword: (passwordData: { current_password: string; new_password: string }): Promise<AxiosResponse<ApiResponse>> =>
    api.put('/auth/change-password', passwordData),
};

// Members API
export const membersAPI = {
  getMembers: (params?: any): Promise<AxiosResponse<ApiResponse<{ members: any[]; pagination: any }>>> =>
    api.get('/members', { params }),
  
  getMember: (id: string): Promise<AxiosResponse<ApiResponse<{ member: any }>>> =>
    api.get(`/members/${id}`),
  
  createMember: (memberData: any): Promise<AxiosResponse<ApiResponse<{ member: any }>>> =>
    api.post('/members', memberData),
  
  updateMember: (id: string, memberData: any): Promise<AxiosResponse<ApiResponse<{ member: any }>>> =>
    api.put(`/members/${id}`, memberData),
  
  deleteMember: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/members/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getSubscriptions: (params?: any): Promise<AxiosResponse<ApiResponse<{ subscriptions: any[]; pagination: any }>>> =>
    api.get('/subscriptions', { params }),
  
  getSubscriptionTypes: (): Promise<AxiosResponse<ApiResponse<{ subscription_types: any[] }>>> =>
    api.get('/subscriptions/types'),
  
  createSubscriptionType: (typeData: any): Promise<AxiosResponse<ApiResponse<{ subscription_type: any }>>> =>
    api.post('/subscriptions/types', typeData),
  
  createSubscription: (subscriptionData: any): Promise<AxiosResponse<ApiResponse<{ subscription: any }>>> =>
    api.post('/subscriptions', subscriptionData),
  
  freezeSubscription: (id: string, data: { reason: string; days: number }): Promise<AxiosResponse<ApiResponse<{ subscription: any }>>> =>
    api.put(`/subscriptions/${id}/freeze`, data),
  
  unfreezeSubscription: (id: string): Promise<AxiosResponse<ApiResponse<{ subscription: any }>>> =>
    api.put(`/subscriptions/${id}/unfreeze`),
};

// Payments API
export const paymentsAPI = {
  getPayments: (params?: any): Promise<AxiosResponse<ApiResponse<{ payments: any[]; pagination: any; totals: any }>>> =>
    api.get('/payments', { params }),
  
  getPayment: (id: string): Promise<AxiosResponse<ApiResponse<{ payment: any }>>> =>
    api.get(`/payments/${id}`),
  
  createPayment: (paymentData: any): Promise<AxiosResponse<ApiResponse<{ payment: any }>>> =>
    api.post('/payments', paymentData),
  
  refundPayment: (id: string, data: { refund_amount: number; refund_reason: string }): Promise<AxiosResponse<ApiResponse<{ payment: any }>>> =>
    api.put(`/payments/${id}/refund`, data),
  
  getMemberPayments: (memberId: string): Promise<AxiosResponse<ApiResponse<{ payments: any[] }>>> =>
    api.get(`/payments/member/${memberId}`),
};

// Reports API
export const reportsAPI = {
  getDashboard: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/reports/dashboard'),

  getRevenueReport: (params?: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/reports/revenue', { params }),

  getMembersReport: (params?: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/reports/members', { params }),
};

// Messages API
export const messagesAPI = {
  getMessages: (params?: any): Promise<AxiosResponse<ApiResponse<{ messages: any[]; pagination: any }>>> =>
    api.get('/messages', { params }),
  
  sendMessage: (messageData: any): Promise<AxiosResponse<ApiResponse<{ message: any }>>> =>
    api.post('/messages/send', messageData),
  
  sendBulkMessage: (messageData: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/messages/bulk', messageData),
  
  getTemplates: (): Promise<AxiosResponse<ApiResponse<{ templates: any }>>> =>
    api.get('/messages/templates'),
};

export default api;
