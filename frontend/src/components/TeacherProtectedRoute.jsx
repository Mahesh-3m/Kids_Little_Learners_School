import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isTeacherAuthenticated } from '../services/api';

export default function TeacherProtectedRoute({ children }) {
  const isAuth = isTeacherAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/teacher/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
