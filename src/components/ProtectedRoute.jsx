import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  // Make role check case-insensitive
  const userRole = user.role.toLowerCase();
  const allowedRoles = roles.map(role => role.toLowerCase());
  
  console.log('User role:', userRole, 'Allowed roles:', allowedRoles);
  
  if (roles && !allowedRoles.includes(userRole)) {
    // User's role is not authorized, redirect to home page
    console.log('Unauthorized role, redirecting');
    return <Navigate to="/" replace />;
  }

  // Authorized, render component
  return children;
};

export default ProtectedRoute;
