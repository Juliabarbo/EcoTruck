import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.15.12:8080/api',
});

api.interceptors.request.use(async (config) => {
  const requestUrl = config.url || '';

  if (requestUrl.startsWith('/auth/')) {
    return config;
  }

  const token = await AsyncStorage.getItem('@ecotruck/token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      await AsyncStorage.multiRemove([
        '@ecotruck/token',
        '@ecotruck/userName',
        '@ecotruck/userEmail',
        '@ecotruck/userRole',
      ]);
    }

    return Promise.reject(error);
  }
);

export default api;
