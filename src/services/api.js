import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Bearer token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginUser = (email, password) => {
  console.log('Making login request with:', email);
  return api.post('/api/auth/login', { email, password })
    .then(response => {
      console.log('Login successful, response:', response.data);
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response;
    })
    .catch(error => {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error('Network error. Please try again.');
    });
};
export const login = loginUser; // Keep backward compatibility
export const getCurrentUser = () => api.get('/api/auth/me');

// Companies API
export const getCompanies = async () => {
  try {
    const response = await api.get('/api/companies', {
      timeout: 10000, // 10 second timeout
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const addCompany = (data) => {
  console.log('Adding company with data:', data);
  return api.post('/api/companies', data)
    .then(response => {
      console.log('Company added successfully:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error adding company:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        error: error.message
      });
      throw error;
    });
};

export const updateCompany = (id, data) => api.put(`/api/companies/${id}`, data);
export const deleteCompany = (id) => api.delete(`/api/companies/${id}`);
export const getCompanyMetrics = (id) => api.get(`/api/companies/${id}/metrics`);

// Users API
export const getUsers = async () => {
  try {
    const response = await api.get('/api/users', {
      timeout: 10000, // 10 second timeout
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
export const addUser = (data) => {
  console.log('Raw form data:', data);
  
  // Validate data
  if (!data.password) {
    console.error('Password is missing from form data');
    throw new Error('Password is required');
  }

  // Transform the data to match backend expectations
  const userData = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role.toLowerCase(), // Use lowercase role
    company: data.company_id ? { id: data.company_id } : null // Transform company_id to company object
  };
  
  console.log('Transformed user data:', JSON.stringify(userData, null, 2));
  
  // Add request interceptor specifically for this call
  const source = axios.CancelToken.source();
  
  return api.post('/api/users', userData, {
    cancelToken: source.token,
    validateStatus: function (status) {
      return status < 500; // Don't reject if status is less than 500
    }
  }).then(response => {
    console.log('Server response:', response);
    if (response.status !== 200) {
      throw new Error(response.data || 'Error creating user');
    }
    return response;
  }).catch(error => {
    console.error('Detailed error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  });
};
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);
// Notification API functions
export const getNotifications = () => api.get('/api/users/notifications');
export const markNotificationAsRead = (id) => api.put(`/api/users/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/api/users/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/api/users/notifications/${id}`);
export const getUnreadNotificationCount = () => api.get('/api/users/notifications/unread-count');
export const deleteNotificationBySubmissionId = (submissionId) => api.delete(`/api/users/notifications/submission/${submissionId}`);

// Chart Data API
export const getChartData = () => {
  return api.get('/api/esg/chart-data');
};

// GHG Emissions API
export const submitGHGEmissionData = async (data) => {
  try {
    console.log('Submitting GHG emission data:', data);
    const response = await api.post('/api/ghg-emissions', data, {
      timeout: 15000, // 15 second timeout
    });
    console.log('GHG emission submission response:', response);
    return response;
  } catch (error) {
    console.error('Error submitting GHG emission data:', error);
    
    // Provide more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

// Social Data API
export const submitSocialData = async (data) => {
  try {
    console.log('Submitting social data:', data);
    const response = await api.post('/api/social-metrics', data, {
      timeout: 15000, // 15 second timeout
    });
    console.log('Social data submission response:', response);
    return response;
  } catch (error) {
    console.error('Error submitting social data:', error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw error;
    }
  }
};

// Governance Data API
export const submitGovernanceData = async (data) => {
  try {
    console.log('Submitting governance data:', data);
    const response = await api.post('/api/governance-metrics', data, {
      timeout: 15000, // 15 second timeout
    });
    console.log('Governance data submission response:', response);
    return response;
  } catch (error) {
    console.error('Error submitting governance data:', error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw error;
    }
  }
};

export const getGHGEmissionsByCompany = () => {
  return api.get('/api/ghg-emissions/company');
};

export const getSocialMetricsByCompany = () => {
  return api.get('/api/social-metrics/company');
};

export const getGovernanceMetricsByCompany = () => {
  return api.get('/api/governance-metrics/company');
};

export const updateGHGEmissionStatus = (id, status) => {
  return api.put(`/api/ghg-emissions/${id}/status`, { status });
};

export const updateSocialMetricStatus = (id, status) => {
  return api.put(`/api/social-metrics/${id}/status`, { status });
};

export const updateGovernanceMetricStatus = (id, status) => {
  return api.put(`/api/governance-metrics/${id}/status`, { status });
};

// History endpoints
export const getGHGEmissionsHistory = () => {
  return api.get('/api/ghg-emissions/history');
};

export const getSocialMetricsHistory = () => {
  return api.get('/api/social-metrics/history');
};

export const getGovernanceMetricsHistory = () => {
  return api.get('/api/governance-metrics/history');
};

// CSV Upload API
export const uploadCSVFile = (formData) => {
  return api.post('/api/ghg-emissions/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // 60 second timeout for larger files
  });
};

// Metric Category API
export const getMetricCategories = (type) => {
  return api.get(`/api/categories/${type}`);
};

export const getMetricCategoryByCode = (type, code) => {
  return api.get(`/api/categories/${type}/${code}`);
};

export const createMetricCategory = (categoryData) => {
  return api.post('/api/categories', categoryData);
};

export const initializeMetricCategories = () => {
  return api.post('/api/categories/initialize');
};

export default api;
