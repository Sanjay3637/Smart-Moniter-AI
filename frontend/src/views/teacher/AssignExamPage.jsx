import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stack,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useGetExamsQuery, useGetCategoriesQuery } from 'src/slices/examApiSlice';
import {
  useCreateAssignmentMutation,
  useGetTeacherAssignmentsQuery,
  useDeleteAssignmentMutation,
} from 'src/slices/assignmentApiSlice';
import { toast } from 'react-toastify';
import { IconTrash, IconSend, IconUser, IconCalendar } from '@tabler/icons-react';

const AssignExamPage = () => {
  const { data: exams, isLoading: examsLoading } = useGetExamsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: assignments, refetch } = useGetTeacherAssignmentsQuery();
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();

  const [formData, setFormData] = useState({
    examId: '',
    examName: '',
    studentRoll: '',
    dueDate: '',
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [filteredExams, setFilteredExams] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'examId') {
      const selectedExam = exams?.find((exam) => exam._id === value);
      setFormData({
        ...formData,
        examId: value,
        examName: selectedExam?.examName || '',
      });
    } else if (name === 'categoryId') {
      setSelectedCategoryId(value);
      // reset exam selection when category changes
      setFormData({
        ...formData,
        examId: '',
        examName: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Initialize default category if available
  React.useEffect(() => {
    if (categories?.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  // Filter exams by selected category and ensure selected exam stays valid
  React.useEffect(() => {
    if (exams) {
      const next = selectedCategoryId
        ? exams.filter((ex) => ex.category?._id === selectedCategoryId)
        : [...exams];
      setFilteredExams(next);

      if (formData.examId && !next.some((ex) => ex._id === formData.examId)) {
        setFormData((prev) => ({ ...prev, examId: '', examName: '' }));
      }
    }
  }, [exams, selectedCategoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.examId || !formData.studentRoll || !formData.dueDate) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await createAssignment(formData).unwrap();
      toast.success('Exam assigned successfully!');
      setFormData({
        examId: '',
        examName: '',
        studentRoll: '',
        dueDate: '',
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign exam');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await deleteAssignment(id).unwrap();
        toast.success('Assignment removed successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete assignment');
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

  return (
    <PageContainer title="Assign Exam" description="Assign exams to students">
      <Box>
        <Typography variant="h4" mb={3} fontWeight={600}>
          Assign Exam to Student
        </Typography>

        <Grid container spacing={3}>
          {/* Assignment Form */}
          <Grid item xs={12} md={5}>
            <DashboardCard title="Create Assignment">
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    select
                    fullWidth
                    label="Select Category"
                    name="categoryId"
                    value={selectedCategoryId}
                    onChange={handleChange}
                    size="small"
                  >
                    {categories?.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Select Exam"
                    name="examId"
                    value={formData.examId}
                    onChange={handleChange}
                    required
                    disabled={examsLoading || filteredExams.length === 0}
                    size="small"
                  >
                    {filteredExams?.map((exam) => (
                      <MenuItem key={exam._id} value={exam._id}>
                        {exam.examName}
                      </MenuItem>
                    ))}
                    {filteredExams?.length === 0 && (
                      <MenuItem disabled>No exams available for this category</MenuItem>
                    )}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Student Roll Number"
                    name="studentRoll"
                    value={formData.studentRoll}
                    onChange={handleChange}
                    placeholder="e.g. 2021CS101"
                    required
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    size="small"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isCreating}
                    startIcon={<IconSend size={18} />}
                  >
                    {isCreating ? 'Assigning...' : 'Assign Exam'}
                  </Button>
                </Stack>
              </form>
            </DashboardCard>
          </Grid>

          {/* Assignments List */}
          <Grid item xs={12} md={7}>
            <DashboardCard title={`Assigned Exams (${assignments?.length || 0})`}>
              {assignments && assignments.length > 0 ? (
                <Stack spacing={2}>
                  {assignments.map((assignment) => (
                    <Paper
                      key={assignment._id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderColor: 'grey.500',
                        borderRadius: 2,
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: 'rgba(90,106,133,0.04)' },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flexGrow={1}>
                          <Typography variant="h6" fontWeight={600} mb={1}>
                            {assignment.examName}
                          </Typography>

                          <Stack direction="row" spacing={1} mb={1}>
                            <Chip
                              label={assignment.status.toUpperCase()}
                              color={getStatusColor(assignment.status)}
                              size="small"
                            />
                            {assignment.score !== undefined && (
                              <Chip
                                label={`Score: ${assignment.score}%`}
                                color="primary"
                                size="small"
                              />
                            )}
                          </Stack>

                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconUser size={16} />
                                <Typography variant="body2" color="textSecondary">
                                  {assignment.studentName}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {assignment.studentRoll || assignment.studentEmail}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconCalendar size={16} />
                                <Typography variant="body2" color="textSecondary">
                                  Due: {formatDate(assignment.dueDate)}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        <IconButton
                          color="error"
                          onClick={() => handleDelete(assignment._id)}
                          sx={{ ml: 2 }}
                        >
                          <IconTrash size={20} />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No assignments created yet
                  </Typography>
                </Box>
              )}
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default AssignExamPage;
