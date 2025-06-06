import axios, { AxiosResponse } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://22njky-5000.csb.app/api',
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

// Mock Auth API (temporary solution)
export const authAPI = {
  login: (credentials: { login: string; password: string }): Promise<AxiosResponse<ApiResponse<{ user: any; token: string }>>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if ((credentials.login === 'admin' || credentials.login === 'admin@admin.com') && credentials.password === 'admin123456') {
          resolve({
            data: {
              status: 'success',
              data: {
                user: {
                  id: '1',
                  username: 'admin',
                  email: 'admin@admin.com',
                  full_name: 'مدير النظام',
                  phone: '01063864546',
                  role: 'admin',
                  is_active: true,
                  last_login: new Date().toISOString(),
                  avatar: null
                },
                token: 'mock_token_' + Date.now()
              }
            }
          } as any);
        } else {
          reject({
            response: {
              data: {
                message: 'بيانات تسجيل الدخول غير صحيحة'
              }
            }
          });
        }
      }, 1000);
    });
  },

  register: (userData: any): Promise<AxiosResponse<ApiResponse<{ user: any; token: string }>>> =>
    api.post('/auth/register', userData),

  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<{ user: any }>>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            status: 'success',
            data: {
              user: {
                id: '1',
                username: 'admin',
                email: 'admin@admin.com',
                full_name: 'مدير النظام',
                phone: '01063864546',
                role: 'admin',
                is_active: true,
                last_login: new Date().toISOString(),
                avatar: null
              }
            }
          }
        } as any);
      }, 500);
    });
  },

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

// Reports API with Mock Data
export const reportsAPI = {
  getDashboard: (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            status: 'success',
            data: {
              stats: {
                total_members: 150,
                active_subscriptions: 120,
                total_revenue: 45000,
                monthly_revenue: 15000,
                new_members_this_month: 25,
                expiring_subscriptions: 8
              },
              recent_payments: [
                { id: 1, member: { full_name: 'أحمد محمد' }, amount: 500, payment_date: new Date().toISOString(), payment_method: 'cash' },
                { id: 2, member: { full_name: 'فاطمة علي' }, amount: 300, payment_date: new Date().toISOString(), payment_method: 'card' },
                { id: 3, member: { full_name: 'محمد أحمد' }, amount: 400, payment_date: new Date().toISOString(), payment_method: 'cash' }
              ],
              revenue_chart: [
                { name: 'يناير', amount: 12000 },
                { name: 'فبراير', amount: 15000 },
                { name: 'مارس', amount: 18000 },
                { name: 'أبريل', amount: 16000 },
                { name: 'مايو', amount: 20000 },
                { name: 'يونيو', amount: 22000 }
              ],
              subscription_types: [
                { name: 'شهري', value: 60, color: '#1976d2' },
                { name: 'ربع سنوي', value: 35, color: '#388e3c' },
                { name: 'نصف سنوي', value: 25, color: '#f57c00' },
                { name: 'سنوي', value: 30, color: '#d32f2f' }
              ]
            }
          }
        } as any);
      }, 800);
    });
  },

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
