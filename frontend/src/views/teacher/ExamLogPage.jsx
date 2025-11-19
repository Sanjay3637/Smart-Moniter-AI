import React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import CheatingTable from './components/CheatingTable';

const ExamLogPage = () => {
  return (
    <PageContainer title="ExamLog Page" description="this is ExamLog page">
      <DashboardCard title="ExamLog Page">
        <CheatingTable />
      </DashboardCard>
    </PageContainer>
  );
};

export default ExamLogPage;
