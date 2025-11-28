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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  InputAdornment,
} from '@mui/material';
import { IconTrash, IconLock, IconLockOpen, IconSearch } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useGetExamsQuery, useDeleteExamMutation, useGetCategoriesQuery, useDeleteCategoryMutation, useUpdateExamAccessCodeMutation } from 'src/slices/examApiSlice';
import { useGetTeacherAssignmentsQuery, useUpdateAssignmentMutation } from 'src/slices/assignmentApiSlice';
import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const ManageExamsPage = () => {
  // const navigate = useNavigate();
  const { data: exams, isLoading, isError, refetch } = useGetExamsQuery();
  const { data: categories = [], refetch: refetchCategories } = useGetCategoriesQuery();
  const { data: teacherAssignments = [], refetch: refetchAssign } = useGetTeacherAssignmentsQuery();
  const [updateAssignment, { isLoading: updatingAssign }] = useUpdateAssignmentMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [updateAccessCode, { isLoading: isUpdatingCode }] = useUpdateExamAccessCodeMutation();

  const [passOpen, setPassOpen] = React.useState(false);
  const [passValue, setPassValue] = React.useState('');
  const [selectedExam, setSelectedExam] = React.useState(null);
  const [attemptsOpen, setAttemptsOpen] = React.useState(false);
  const [attemptsValue, setAttemptsValue] = React.useState('1');
  const [resetUsed, setResetUsed] = React.useState(true);

  const openPassDialog = (exam) => {
    setSelectedExam(exam);
    setPassValue('');
    setPassOpen(true);
  };
  const openAttemptsDialog = (exam) => {
    setSelectedExam(exam);
    setAttemptsValue('1');
    setResetUsed(true);
    setAttemptsOpen(true);
  };
  const closeAttemptsDialog = () => {
    setAttemptsOpen(false);
    setSelectedExam(null);
  };
  const saveAttemptsAll = async () => {
    if (!selectedExam) return;
    const max = Math.max(1, Number(attemptsValue) || 1);
    try {
      const affected = teacherAssignments.filter((a) => a.examId === selectedExam._id || a.examId === String(selectedExam._id) || a.examId === selectedExam.examId);
      for (const a of affected) {
        await updateAssignment({ id: a._id, maxAttempts: max, ...(resetUsed ? { attemptsUsed: 0, status: 'pending' } : {}) }).unwrap();
      }
      toast.success(`Attempts ${affected.length ? 'updated' : 'no assignments found'}`);
      closeAttemptsDialog();
      refetchAssign();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update attempts');
    }
  };
  const closePassDialog = () => {
    setPassOpen(false);
    setSelectedExam(null);
    setPassValue('');
  };
  const savePass = async () => {
    if (!selectedExam) return;
    try {
      await updateAccessCode({ id: selectedExam._id, accessCode: passValue }).unwrap();
      toast.success(passValue ? 'Password set for exam' : 'Password cleared');
      closePassDialog();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to update password');
    }
  };
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();

  const [query, setQuery] = React.useState('');
  const normalized = query.trim().toLowerCase();
  const filteredExams = React.useMemo(() => {
    if (!exams) return [];
    if (!normalized) return exams;
    return exams.filter((e) => {
      const name = (e.examName || '').toLowerCase();
      const cat = (e.category?.name || '').toLowerCase();
      return name.includes(normalized) || cat.includes(normalized);
    });
  }, [exams, normalized]);

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap">
          <Typography variant="h6">All Exams ({exams?.length || 0})</Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto' }}>
            <TextField
              size="small"
              placeholder="Search exams or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
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
          {filteredExams && filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
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
                      <Chip
                        label={exam.accessCode ? 'Password Protected' : 'No Password'}
                        size="small"
                        icon={exam.accessCode ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                        sx={{ ml: 1, mt: 1 }}
                        color={exam.accessCode ? 'default' : 'warning'}
                      />
                    </Box>

                    <Typography variant="body2" color="textSecondary" mb={0.5}>
                      <strong>Live Date:</strong> {formatDate(exam.liveDate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Deadline:</strong> {formatDate(exam.deadDate)}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={exam.accessCode ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                        onClick={() => openPassDialog(exam)}
                      >
                        {exam.accessCode ? 'Update Password' : 'Set Password'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openAttemptsDialog(exam)}
                      >
                        Edit Attempts
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : null}
        </Grid>
      </DashboardCard>
      {/* Password dialog */}
      <Dialog open={passOpen} onClose={closePassDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{selectedExam?.accessCode ? 'Update Exam Password' : 'Set Exam Password'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Exam Password"
            type="text"
            fullWidth
            autoFocus
            value={passValue}
            onChange={(e) => setPassValue(e.target.value)}
            placeholder={selectedExam?.accessCode ? 'Enter new password (leave empty to clear)' : 'Enter password'}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePassDialog}>Cancel</Button>
          <Button onClick={savePass} variant="contained" disabled={isUpdatingCode}>
            {selectedExam?.accessCode && passValue === '' ? 'Clear Password' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Attempts dialog */}
      <Dialog open={attemptsOpen} onClose={closeAttemptsDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Attempts for "{selectedExam?.examName}"</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Max Attempts"
              type="number"
              size="small"
              value={attemptsValue}
              onChange={(e) => setAttemptsValue(e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
            />
            <Box display="flex" alignItems="center" gap={1}>
              <input type="checkbox" id="resetAttempts" checked={resetUsed} onChange={(e) => setResetUsed(e.target.checked)} />
              <label htmlFor="resetAttempts">Reset used attempts for all assignees</label>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAttemptsDialog}>Cancel</Button>
          <Button onClick={saveAttemptsAll} variant="contained" disabled={updatingAssign}>Save</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ManageExamsPage;
