import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import Exams from './Components/Exams';
import { useSelector } from 'react-redux';

const ExamPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  return (
    <PageContainer title="Dashboard" description="Active Exams">
      <Box
        sx={{
          mb: 2.5,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
          borderRadius: 3,
          background: 'linear-gradient(180deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 6px 20px rgba(15,23,42,0.06)'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {greeting}, {userInfo?.name ? userInfo.name.split(' ')[0] : 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back to SmartMonitor. Your active exams are listed below.
        </Typography>
      </Box>
      <DashboardCard title="All Active Exams">
        <Exams />
      </DashboardCard>
    </PageContainer>
  );
};

export default ExamPage;
