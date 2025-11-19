import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useGetExamsQuery, useDeleteExamMutation, useGetCategoriesQuery, useDeleteCategoryMutation } from 'src/slices/examApiSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const ManageExamsPage = () => {
  const navigate = useNavigate();
  const { data: exams, isLoading, isError, refetch } = useGetExamsQuery();
  const { data: categories = [], refetch: refetchCategories } = useGetCategoriesQuery();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();

  const handleDeleteExam = async (examId, examName) => {
    const willDelete = await swal({
      title: 'Are you sure?',
      text: `Do you want to delete "${examName}"? This action cannot be undone!`,
      icon: 'warning',
      buttons: ['Cancel', 'Delete'],
      dangerMode: true,
    });

    if (willDelete) {
      try {
        await deleteExam(examId).unwrap();
        toast.success('Exam deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete exam');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <PageContainer title="Manage Exams" description="Manage all exams">
        <DashboardCard title="Manage Exams">
          <Typography>Loading exams...</Typography>
        </DashboardCard>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer title="Manage Exams" description="Manage all exams">
        <DashboardCard title="Manage Exams">
          <Typography color="error">Error loading exams. Please try again.</Typography>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Manage Exams" description="Manage all exams">
      <DashboardCard title="Manage Exams">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">All Exams ({exams?.length || 0})</Typography>
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => navigate('/create-exam')}
          >
            Create New Exam
          </Button>
        </Box>

        {/* Categories management */}
        <Box mb={3}>
          <Typography variant="subtitle1" mb={1}>Categories</Typography>
          <Grid container spacing={2}>
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <Grid item key={cat._id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label={cat.name} />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async () => {
                        const willDelete = await swal({
                          title: 'Delete category?',
                          text: `Delete category "${cat.name}" and all its association?`,
                          icon: 'warning',
                          buttons: ['Cancel', 'Delete'],
                          dangerMode: true,
                        });
                        if (willDelete) {
                          try {
                            await deleteCategory(cat._id).unwrap();
                            toast.success('Category deleted');
                            refetchCategories();
                            refetch();
                          } catch (err) {
                            toast.error(err?.data?.message || 'Failed to delete category');
                          }
                        }
                      }}
                    >
                      <IconTrash size={16} />
                    </IconButton>
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item>
                <Typography color="textSecondary">No categories yet</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {exams && exams.length > 0 ? (
            exams.map((exam) => (
              <Grid item xs={12} sm={6} md={4} key={exam._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, pr: 1 }}>
                        {exam.examName}
                      </Typography>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteExam(exam._id, exam.examName)}
                        disabled={isDeleting}
                        sx={{ mt: -1 }}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Box>

                    <Box mb={2}>
                      <Chip
                        label={`${exam.totalQuestions} Questions`}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`${exam.duration} mins`}
                        size="small"
                        color="secondary"
                        sx={{ mb: 1 }}
                      />
                      {exam.category && exam.category.name ? (
                        <Chip label={exam.category.name} size="small" sx={{ ml: 1 }} />
                      ) : null}
                    </Box>

                    <Typography variant="body2" color="textSecondary" mb={0.5}>
                      <strong>Live Date:</strong> {formatDate(exam.liveDate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Deadline:</strong> {formatDate(exam.deadDate)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary" mb={2}>
                  No exams created yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => navigate('/create-exam')}
                >
                  Create Your First Exam
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
};

export default ManageExamsPage;
