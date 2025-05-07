import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Базовий URL вашого API
axios.defaults.baseURL = 'http://10.0.2.2:8080'; // Для емулятора Android
// axios.defaults.baseURL = 'http://localhost:8080/api'; // Для реального пристрою

// Request interceptor - додає токен до всіх запитів
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - обробляє відповіді
axios.interceptors.response.use(
  response => response,
  async error => {
    // Якщо помилка 401 і є токен, виходимо з системи
    if (error.response?.status === 401 && await AsyncStorage.getItem('token')) {
      await AsyncStorage.removeItem('token');
      // Тут можна додати навігацію до екрану логіну
      // Потрібно буде налаштувати навігацію за межами компонента
    }
    return Promise.reject(error);
  }
);

export default axios;