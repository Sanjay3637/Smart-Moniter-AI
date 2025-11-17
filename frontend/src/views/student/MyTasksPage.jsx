import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useGetStudentTasksQuery } from 'src/slices/assignmentApiSlice';
import { useGetExamsQuery } from 'src/slices/examApiSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconAlertCircle,
  IconPlayerPlay,
} from '@tabler/icons-react';

const MyTasksPage = () => {
  const navigate = useNavigate();
  const { data: tasks, isLoading, isError, refetch } = useGetStudentTasksQuery();

  // Refetch tasks when component mounts to get latest status
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const handleStartExam = (examId) => {
    // Navigate directly to exam without password check
    navigate(`/exam/${examId}`);
  };

  if (isLoading) {
    return (
      <PageContainer title="My Tasks" description="View your assigned exams">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer title="My Tasks" description="View your assigned exams">
        <DashboardCard title="My Tasks">
          <Typography color="error">Error loading tasks. Please try again.</Typography>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Tasks" description="View your assigned exams">
      <Box>
        <Typography variant="h4" mb={3} fontWeight={600}>
          My Assigned Tasks
        </Typography>

        <DashboardCard title={`Assigned Exams (${tasks?.length || 0})`}>
          {tasks && tasks.length > 0 ? (
            <Grid container spacing={3}>
              {tasks.map((task) => (
                <Grid item xs={12} md={6} lg={4} key={task._id}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box mb={2}>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        {task.examName}
                      </Typography>
                      <Chip
                        label={task.status.toUpperCase()}
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                    </Box>

                    <Stack spacing={1.5} mb={2} flexGrow={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconUser size={18} />
                        <Typography variant="body2" color="textSecondary">
                          Assigned by: <strong>{task.assignedBy}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <IconCalendar size={18} />
                        <Typography variant="body2" color="textSecondary">
                          Due: <strong>{formatDate(task.dueDate)}</strong>
                        </Typography>
                      </Box>

                      {isOverdue(task.dueDate) && task.status === 'pending' && (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{ color: 'error.main' }}
                        >
                          <IconAlertCircle size={18} />
                          <Typography variant="body2" fontWeight={600}>
                            Overdue!
                          </Typography>
                        </Box>
                      )}

                      {task.status === 'completed' && task.score !== undefined && (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{ color: 'success.main' }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            Score: {task.score}%
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {task.status === 'pending' && (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<IconPlayerPlay size={18} />}
                        onClick={() => handleStartExam(task.examId)}
                      >
                        Start Exam
                      </Button>
                    )}

                    {task.status === 'completed' && (
                      <Button variant="outlined" fullWidth disabled>
                        Completed
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={6}>
              <IconAlertCircle size={64} color="gray" />
              <Typography variant="h6" color="textSecondary" mt={2}>
                No tasks assigned yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your teacher will assign exams to you here
              </Typography>
            </Box>
          )}
        </DashboardCard>
      </Box>
    </PageContainer>
  );
};

export default MyTasksPage;
