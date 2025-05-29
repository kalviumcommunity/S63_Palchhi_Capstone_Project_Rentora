import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Define route access rules
  const routeAccess = {
    '/add-listing': ['seller', 'admin'],
    '/my-listings': ['seller', 'admin'],
    '/admin': ['admin'],
    '/profile': ['buyer', 'seller', 'admin'],
    '/wishlist': ['buyer', 'seller', 'admin'],
    '/notifications': ['buyer', 'seller', 'admin'],
    '/chats': ['buyer', 'seller', 'admin'],
    '/chat/:chatId': ['buyer', 'seller', 'admin']
  };

  // Check if the current path matches any route pattern
  const matchingRoute = Object.keys(routeAccess).find(route => {
    if (route.includes(':')) {
      const routePattern = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
      return routePattern.test(path);
    }
    return route === path;
  });

  if (matchingRoute) {
    const allowedRoles = routeAccess[matchingRoute];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
