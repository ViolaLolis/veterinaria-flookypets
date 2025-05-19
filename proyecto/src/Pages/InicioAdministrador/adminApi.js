import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin';

const adminApi = {
  // Servicios
  getServices: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  addService: async (service) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/services`, service);
      return response.data;
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  updateService: async (id, service) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/services/${id}`, service);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  deleteService: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Personal
  getStaff: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  addStaff: async (staff) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staff`, staff);
      return response.data;
    } catch (error) {
      console.error('Error adding staff:', error);
      throw error;
    }
  },

  updateStaff: async (id, staff) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/staff/${id}`, staff);
      return response.data;
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  },

  deleteStaff: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/staff/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  },

  // Reuniones
  getMeetings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  },

  addMeeting: async (meeting) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/meetings`, meeting);
      return response.data;
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  },

  updateMeeting: async (id, meeting) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/meetings/${id}`, meeting);
      return response.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  },

  deleteMeeting: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  },

  // Estadísticas
  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Actividad reciente
  getRecentActivity: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/activity`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
};

export default adminApi;