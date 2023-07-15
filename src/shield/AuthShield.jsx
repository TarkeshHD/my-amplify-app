import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthShield = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  console.log('Is Authenticated', isAuthenticated);
  console.log('Is initialize', isInitialized);
  if (!isInitialized) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  return <>{children}</>;
};

export default AuthShield;
