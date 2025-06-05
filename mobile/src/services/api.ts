import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const api = axios.create({
  baseURL: 'http://10.0.2.2:5000/api', // Android emulator localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Navigate to login screen
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

// Auth API for members
export const authAPI = {
  memberLogin: (credentials: { phone: string; member_number: string }): Promise<AxiosResponse<ApiResponse<{ member: any; token: string }>>> =>
    api.post('/auth/member-login', credentials),
  
  getMemberProfile: (): Promise<AxiosResponse<ApiResponse<{ member: any }>>> =>
    api.get('/auth/member-profile'),
  
  updateMemberProfile: (profileData: any): Promise<AxiosResponse<ApiResponse<{ member: any }>>> =>
    api.put('/auth/member-profile', profileData),
};

// Member API
export const memberAPI = {
  getCurrentSubscription: (): Promise<AxiosResponse<ApiResponse<{ subscription: any }>>> =>
    api.get('/members/current-subscription'),
  
  getPaymentHistory: (): Promise<AxiosResponse<ApiResponse<{ payments: any[] }>>> =>
    api.get('/members/payment-history'),
  
  getMessages: (): Promise<AxiosResponse<ApiResponse<{ messages: any[] }>>> =>
    api.get('/members/messages'),
  
  markMessageAsRead: (messageId: string): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/members/messages/${messageId}/read`),
};

export default api;
