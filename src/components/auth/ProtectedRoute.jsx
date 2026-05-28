// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Spinner } from '../ui';

const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireRole && !hasRole(requireRole)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
