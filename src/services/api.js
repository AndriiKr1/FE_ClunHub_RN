import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL configuration
const api = axios.create({
  baseURL: 'http://10.0.2.2:8080', // For Android emulator
  // baseURL: 'http://localhost:8080', // For iOS simulator
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles responses
api.interceptors.response.use(
  response => response,
  async error => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && await AsyncStorage.getItem('token')) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // You can add navigation to login screen here when using a navigation service
      // navigationService.navigate('Login');
    }
    
    return Promise.reject(error);
  }
);

export default api;