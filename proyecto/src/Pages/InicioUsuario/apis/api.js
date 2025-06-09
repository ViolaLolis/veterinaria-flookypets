import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserData = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const getPets = async (userId) => {
  try {
    const response = await api.get(`/user/pets/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
};

export const getAppointments = async (userId) => {
  try {
    const response = await api.get(`/user/appointments/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getReminders = async (userId) => {
  try {
    const response = await api.get(`/user/reminders/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/login', {
      email,
      password
    });

    // Guarda el token y el ID del usuario en localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userId', response.data.id);

    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data || error.message);
    throw error;
  }
};
