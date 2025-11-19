import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import {
  IconTrophy,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useGetResults } from 'src/slices/resultsApiSlice';
import { toast } from 'react-toastify';
// no navigation needed on student results list

const MyResultsPage = () => {
  const { results = [], isLoading, error, refetch } = useGetResults();
  const [localError, setLocalError] = useState(null);

  // Debug log to check the API response
  useEffect(() => {
    console.log('Results data:', results);
    if (results && results.length > 0) {
      console.log('First result item:', results[0]);
      console.log('Exam data:', results[0].exam);
    }
  }, [results]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      toast.error(error);
    } else {
      setLocalError(null);
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Results refreshed successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Error refreshing results');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return <IconCheck color="#4caf50" size={20} />;
      case 'failed':
        return <IconX color="#f44336" size={20} />;
      default:
        return <IconAlertCircle color="#ff9800" size={20} />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="My Results">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">My Exam Results</Typography>
            <Button
              variant="outlined"
              startIcon={<IconRefresh size={20} />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>

          {localError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {localError}
            </Alert>
          )}

          {results.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <IconTrophy size={48} color="#9e9e9e" />
                  <Typography variant="h6" color="textSecondary" mt={2}>
                    No results found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Your exam results will appear here once they are available.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                <TableCell>Exam</TableCell>
                <TableCell align="center">Category</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="center">Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(results) && results.length > 0 ? (
                      results.map((result) => {
                        // Extract exam details - could be populated or just an ID
                        const examName = result.exam?.examName || result.examName || 'Unnamed Exam';
                        const examId = result.exam?._id || result.exam || result.examId;
                        
                        // Debug log for each result
                        console.log('Rendering result:', {
                          id: result._id,
                          exam: result.exam,
                          examId: examId,
                          examName: examName,
                          score: result.score,
                          totalQuestions: result.totalQuestions,
                          percentage: result.percentage,
                          date: result.submittedAt || result.updatedAt || result.createdAt
                        });
                        
                        // Calculate status based on percentage if not present
                        const status = result.status || (result.percentage >= 60 ? 'Passed' : 'Failed');
                        
                        return (
                          <TableRow key={result._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {examName}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Score: {result.percentage?.toFixed(0) || 0}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" color="textSecondary">
                                {result.exam?.category?.name || result.examCategoryName || result.category?.name || 'Uncategorized'}
                              </Typography>
                            </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getStatusIcon(status)}
                            label={status}
                            color={getStatusColor(status)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="body2">
                              {result.score} / {result.totalQuestions}
                            </Typography>
                            <Box width={60} mt={0.5}>
                              <LinearProgress
                                variant="determinate"
                                value={result.percentage || 0}
                                color={status === 'Passed' ? 'success' : 'error'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {result.submittedAt 
                              ? formatDate(result.submittedAt) 
                              : result.updatedAt 
                                ? formatDate(result.updatedAt)
                                : 'N/A'}
                          </Typography>
                        </TableCell>
                        
                        </TableRow>
                      )})
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Box>
                            <IconTrophy size={48} color="#9e9e9e" />
                            <Typography variant="h6" color="textSecondary" mt={2}>
                              No results found
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mt={1}>
                              Your exam results will appear here once they are available.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default MyResultsPage;
