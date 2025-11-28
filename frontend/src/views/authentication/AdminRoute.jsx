import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? <Outlet /> : <Navigate to="/auth/admin-login" replace />;
};

export default AdminRoute;
