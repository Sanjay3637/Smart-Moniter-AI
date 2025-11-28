import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetQuestionsQuery, useGetExamsQuery, useUpdateExamAccessCodeMutation } from 'src/slices/examApiSlice';
import { useGetTeacherAssignmentsQuery, useUpdateAssignmentMutation } from 'src/slices/assignmentApiSlice';
import PageContainer from 'src/components/container/PageContainer';
import { IconArrowLeft, IconEdit, IconLock, IconUser, IconPencil } from '@tabler/icons-react';
import { toast } from 'react-toastify';

const ExamDetailsView = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const { data: exams, isLoading: examsLoading } = useGetExamsQuery();
  const { data: questions, isLoading: questionsLoading } = useGetQuestionsQuery(examId);
  const { data: assignments = [], refetch: refetchAssignments } = useGetTeacherAssignmentsQuery();
  const [updateAssignment, { isLoading: updatingAssign }] = useUpdateAssignmentMutation();
  const [updateAccessCode, { isLoading: updatingCode }] = useUpdateExamAccessCodeMutation();

  const [passValue, setPassValue] = React.useState('');
  const [attemptsDialog, setAttemptsDialog] = React.useState(false);
  const [selectedAssign, setSelectedAssign] = React.useState(null);
  const [attemptsValue, setAttemptsValue] = React.useState('1');

  const exam = exams?.find((e) => e._id === examId);
  const examAssigns = React.useMemo(() => {
    if (!assignments || !exam) return [];
    const idStr = String(exam._id);
    return assignments.filter((a) => a.examId === examId || a.examId === idStr || a.examId === exam?.examId);
  }, [assignments, exam, examId]);

  const handleSavePassword = async () => {
    try {
      await updateAccessCode({ id: examId, accessCode: passValue }).unwrap();
      toast.success(passValue ? 'Password updated' : 'Password cleared');
      setPassValue('');
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to update password');
    }
  };

  const openAttempts = (assign) => {
    setSelectedAssign(assign);
    setAttemptsValue(String(assign?.maxAttempts || 1));
    setAttemptsDialog(true);
  };
  const closeAttempts = () => {
    setAttemptsDialog(false);
    setSelectedAssign(null);
  };
  const saveAttempts = async () => {
    if (!selectedAssign) return;
    const max = Math.max(1, Number(attemptsValue) || 1);
    try {
      await updateAssignment({ id: selectedAssign._id, maxAttempts: max }).unwrap();
      toast.success('Attempts updated');
      closeAttempts();
      refetchAssignments();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update attempts');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (examsLoading || questionsLoading) {
    return (
      <PageContainer title="Exam Details" description="View exam details">
        <Card>
          <CardContent>
            <Typography>Loading exam details...</Typography>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!exam) {
    return (
      <PageContainer title="Exam Details" description="View exam details">
        <Card>
          <CardContent>
            <Typography color="error">Exam not found</Typography>
            <Button
              variant="outlined"
              startIcon={<IconArrowLeft />}
              onClick={() => navigate('/manage-exams')}
              sx={{ mt: 2 }}
            >
              Back to Manage Exams
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Exam Details" description="View exam details">
      <Box>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft />}
          onClick={() => navigate('/manage-exams')}
          sx={{ mb: 3 }}
        >
          Back to Manage Exams
        </Button>

        {/* Exam Information Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Typography variant="h4" fontWeight={600}>
                {exam.examName}
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconEdit size={18} />}
                onClick={() => navigate(`/add-questions?examId=${examId}`)}
              >
                Edit Questions
              </Button>
            </Box>

            <Stack direction="row" spacing={1} mb={3}>
              <Chip label={`${exam.totalQuestions} Questions`} color="primary" />
              <Chip label={`${exam.duration} Minutes`} color="secondary" />
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Live Date:</strong>
                </Typography>
                <Typography variant="body1" mb={2}>
                  {formatDate(exam.liveDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Deadline:</strong>
                </Typography>
                <Typography variant="body1" mb={2}>
                  {formatDate(exam.deadDate)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary">
              <strong>Exam ID:</strong> {exam._id}
            </Typography>
          </CardContent>
        </Card>

        {/* Security & Attempts Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Security & Attempts
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom><IconLock size={16} /> Exam Password</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label={exam.accessCode ? 'Update or clear password' : 'Set password'}
                    type="text"
                    size="small"
                    value={passValue}
                    onChange={(e) => setPassValue(e.target.value)}
                    fullWidth
                  />
                  <Button variant="contained" onClick={handleSavePassword} disabled={updatingCode}>
                    Save
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Leave empty and click Save to clear the password.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom><IconUser size={16} /> Per-student Attempts</Typography>
                {examAssigns && examAssigns.length > 0 ? (
                  <Stack spacing={1}>
                    {examAssigns.map((a) => (
                      <Paper key={a._id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{a.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.studentRoll}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={`Attempts ${a.attemptsUsed || 0}/${a.maxAttempts || 1}`} size="small" />
                          <IconButton size="small" onClick={() => openAttempts(a)}>
                            <IconPencil size={16} />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No assignments for this exam yet.</Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Questions ({questions?.length || 0})
            </Typography>

            {questions && questions.length > 0 ? (
              <Stack spacing={3}>
                {questions.map((q, index) => (
                  <Paper key={q._id} elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Question {index + 1}
                    </Typography>
                    <Typography variant="body1" mb={2}>
                      {q.question}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" mb={1}>
                      <strong>Options:</strong>
                    </Typography>
                    <List dense>
                      {q.options?.map((option, optIndex) => (
                        <ListItem key={optIndex}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center">
                                <Typography
                                  component="span"
                                  sx={{
                                    fontWeight: option.isCorrect ? 700 : 400,
                                    color: option.isCorrect ? 'success.main' : 'text.primary',
                                  }}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option.text}
                                </Typography>
                                {option.isCorrect && (
                                  <Chip
                                    label="Correct Answer"
                                    size="small"
                                    color="success"
                                    sx={{ ml: 2 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="textSecondary" mb={2}>
                  No questions added yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<IconEdit size={18} />}
                  onClick={() => navigate(`/add-questions?examId=${examId}`)}
                >
                  Add Questions
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

      </Box>
      {/* Attempts Edit Dialog */}
      <Dialog open={attemptsDialog} onClose={closeAttempts} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Attempts</DialogTitle>
        <DialogContent>
          <TextField
            label="Max Attempts"
            type="number"
            size="small"
            fullWidth
            value={attemptsValue}
            onChange={(e) => setAttemptsValue(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAttempts}>Cancel</Button>
          <Button onClick={saveAttempts} variant="contained" disabled={updatingAssign}>Save</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ExamDetailsView;
