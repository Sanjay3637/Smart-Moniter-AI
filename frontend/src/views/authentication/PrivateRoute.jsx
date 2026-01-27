import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SessionManager from 'src/components/SessionManager';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo ? (
    <SessionManager>
      <Outlet />
    </SessionManager>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};
export default PrivateRoute;
