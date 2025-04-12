import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('AuthContext init - Stored user:', storedUser);
    console.log('AuthContext init - Token exists:', !!storedToken);
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      console.log('AuthContext init - User data found:', userData);
      setUser(userData);
      
      // Check if we need to redirect the user based on their role
      // This handles page refreshes by maintaining the right route
      const currentPath = window.location.pathname;
      const userRole = userData.role.toLowerCase();
      
      console.log('AuthContext init - Current path:', currentPath, 'User role:', userRole);
      
      // Only redirect if we're on the login page or root and the user is already authenticated
      if (currentPath === '/' || currentPath === '/login') {
        console.log('AuthContext init - User is authenticated but on login page, redirecting...');
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'manager') {
          navigate('/manager');
        } else if (userRole === 'representative') {
          navigate('/representative');
        }
      }
    }
    setLoading(false);
  }, [navigate]);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process for', email);
      const response = await loginUser(email, password);
      
      console.log('AuthContext: Login response received:', response.data);
      
      const { token, user: userData, role: responseRole } = response.data;
      
      // Make sure we have a valid user object for storage
      if (!userData || !userData.role) {
        console.error('AuthContext: Invalid user data from server', userData);
        throw new Error('Invalid user data received from server');
      }
      
      // Normalize role to lowercase for consistent handling
      userData.originalRole = userData.role; // Keep original for reference
      userData.role = userData.role.toLowerCase(); // Use lowercase for all role checks
      
      console.log('AuthContext: User data to store:', userData);
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Log what was stored
      console.log('AuthContext: User object set in state:', userData);
      console.log('AuthContext: Stored in localStorage:', JSON.parse(localStorage.getItem('user')));

      // Redirect based on role (case-insensitive)
      const role = userData.role.toLowerCase();
      console.log('AuthContext: User role for routing:', role);
      
      // Use direct window location instead of react-router navigate
      // This is a more forceful redirect approach
      console.log('AuthContext: User role mapped to:', role);
      
      if (role === 'admin') {
        console.log('AuthContext: Redirecting to admin dashboard via window.location');
        window.location.href = '/admin';
      } else if (role === 'manager') {
        console.log('AuthContext: Redirecting to manager dashboard via window.location');
        window.location.href = '/manager';
      } else if (role === 'representative') {
        console.log('AuthContext: Redirecting to representative dashboard via window.location');
        window.location.href = '/representative';
      } else {
        console.log('AuthContext: No matching role route, defaulting to /login');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('AuthContext: Error during login process:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
