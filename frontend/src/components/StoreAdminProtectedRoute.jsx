import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isStoreAuthenticated, isTeacherAuthenticated } from '../services/api';

/**
 * Route guard enforcing Store Manager or Teacher authentication for store-admin sections.
 * Redirects unauthenticated visitors to /store-admin/login.
 */
export default function StoreAdminProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = isStoreAuthenticated() || isTeacherAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/store-admin/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
