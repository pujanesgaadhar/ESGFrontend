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
  return api.post('/auth/login', { email, password })
    .then(response => {
      console.log('Login successful, response:', response.data);
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
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
export const getNotifications = () => api.get('/api/users/notifications');
export const markNotificationRead = (id) => api.put(`/api/users/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/api/users/notifications/${id}`);
export const deleteNotificationBySubmissionId = (submissionId) => api.delete(`/api/users/notifications/submission/${submissionId}`);

// ESG API
export const submitESGData = (data) => {
  return api.post('/api/esg/submissions', data, {
    timeout: 30000 // 30 second timeout
  });
};

// ESG Submissions
export const getESGSubmissions = () => {
  return api.get('/api/esg/submissions');
};

export const getChartData = () => {
  return api.get('/api/esg/chart-data');
};

export const reviewSubmission = (id, data) => api.put(`/api/esg/submissions/${id}/review`, data);
export const getSubmissionById = (id) => api.get(`/api/esg/submissions/${id}`);
export const getSubmissionHistory = () => api.get('/api/esg/submissions/history');

export default api;
