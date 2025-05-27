import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Routes that require seller or admin role
  const sellerAdminRoutes = ['/add-listing', '/my-listings'];
  
  // Check if the current path is in the seller/admin routes
  if (sellerAdminRoutes.includes(path) && user.role !== 'seller' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // For all other protected routes, allow access to any authenticated user
  return <Outlet />;
};

export default ProtectedRoute;
