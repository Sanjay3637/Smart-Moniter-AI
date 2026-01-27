import React from 'react';
import { Typography, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import AddQuestionForm from './components/AddQuestionForm';

const AddQuestions = () => {
  return (
    <PageContainer title="Add Questions" description="Create new assessment questions">
      <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
        <Typography variant="h4" mb={3} fontWeight={700} color="primary">
          Add Questions
        </Typography>
        <AddQuestionForm />
      </Box>
    </PageContainer>
  );
};

export default AddQuestions;
