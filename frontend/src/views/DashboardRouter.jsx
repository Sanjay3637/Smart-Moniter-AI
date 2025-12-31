import React from 'react';
import { useSelector } from 'react-redux';
import DashboardHome from './student/DashboardHome';
import TeacherDashboard from './teacher/TeacherDashboard';

const DashboardRouter = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  if (userInfo?.role === 'teacher') {
    return <TeacherDashboard />;
  }
  
  return <DashboardHome />;
};

export default DashboardRouter;
