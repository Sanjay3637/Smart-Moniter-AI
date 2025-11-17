import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Redirect based on user role
  if (userInfo?.role === 'teacher') {
    return <Navigate to="/teacher-profile" replace />;
  }
  
  return <Navigate to="/profile" replace />;
};

export default ProfilePage;
