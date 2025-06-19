import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/constants';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if the user is trying to access a route they don't have permission for
  const isHRRoute = window.location.pathname === ROUTES.HR_DASHBOARD;
  if (isHRRoute && user.role !== 'hr') {
    return <Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />;
  }

  return children;
};

export default PrivateRoute; 