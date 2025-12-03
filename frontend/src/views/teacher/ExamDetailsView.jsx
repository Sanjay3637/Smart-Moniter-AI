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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetQuestionsQuery, useGetExamsQuery } from 'src/slices/examApiSlice';
import PageContainer from 'src/components/container/PageContainer';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';

const ExamDetailsView = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const { data: exams, isLoading: examsLoading } = useGetExamsQuery();
  const { data: questions, isLoading: questionsLoading } = useGetQuestionsQuery(examId);

  const exam = exams?.find((e) => e._id === examId);

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
                                  {String.fromCharCode(65 + optIndex)}. {option.optionText || option.text}
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
    </PageContainer>
  );
};

export default ExamDetailsView;
