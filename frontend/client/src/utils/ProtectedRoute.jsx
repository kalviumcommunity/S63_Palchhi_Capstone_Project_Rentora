import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
//   Optional: Role-based protection
  const requiredRole = 'admin'; // Get from route meta
  if(user?.role !== requiredRole) return <Navigate to="/unauthorized" />;
  
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
