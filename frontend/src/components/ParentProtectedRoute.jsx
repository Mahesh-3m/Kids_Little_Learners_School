import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isParentAuthenticated } from '../services/api';

export default function ParentProtectedRoute({ children }) {
  const isAuth = isParentAuthenticated();

  if (!isAuth) {
    return <Navigate to="/parent/login" replace />;
  }

  return children ? children : <Outlet />;
}
