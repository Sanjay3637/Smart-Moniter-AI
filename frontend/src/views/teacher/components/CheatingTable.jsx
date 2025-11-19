import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetExamsQuery, useGetCategoriesQuery } from 'src/slices/examApiSlice';
import { useGetCheatingLogsQuery } from 'src/slices/cheatingLogApiSlice';
import { useDeleteCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { useUnblockUserMutation } from 'src/slices/usersApiSlice';

export default function CheatingTable() {
  const [filter, setFilter] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: examsData } = useGetExamsQuery();
  const { data: cheatingLogsData, refetch: refetchCheatingLogs } = useGetCheatingLogsQuery(selectedExamId);
  const [deleteCheatingLog] = useDeleteCheatingLogMutation();
  const [unblockUser] = useUnblockUserMutation();

  // Filter exams based on selected category
  useEffect(() => {
    if (examsData) {
      const filtered = selectedCategoryId 
        ? examsData.filter(exam => exam.category?._id === selectedCategoryId)
        : [...examsData];
      setFilteredExams(filtered);
      
      // Reset selected exam if it's not in the filtered list
      if (selectedExamId && !filtered.some(exam => exam._id === selectedExamId)) {
        setSelectedExamId('');
      }
    }
  }, [examsData, selectedCategoryId, selectedExamId]);

  // Set first category and exam by default
  useEffect(() => {
    if (categoriesData?.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categoriesData[0]._id);
    }
  }, [categoriesData, selectedCategoryId]);

  // Set first exam when filtered exams change
  useEffect(() => {
    if (filteredExams.length > 0 && !selectedExamId) {
      setSelectedExamId(filteredExams[0]._id);
    }
  }, [filteredExams, selectedExamId]);

  // Update cheating logs when selected exam changes
  useEffect(() => {
    if (selectedExamId) {
      refetchCheatingLogs();
    }
  }, [selectedExamId, refetchCheatingLogs]);

  useEffect(() => {
    if (cheatingLogsData) {
      setCheatingLogs(cheatingLogsData);
    }
  }, [cheatingLogsData]);

  const filteredUsers = cheatingLogs.filter(
    (log) =>
      log.username?.toLowerCase().includes(filter.toLowerCase()) ||
      log.email?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Select Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              label="Select Category"
            >
              {categoriesData?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="exam-select-label">Select Exam</InputLabel>
            <Select
              labelId="exam-select-label"
              value={selectedExamId || ''}
              onChange={(e) => setSelectedExamId(e.target.value)}
              label="Select Exam"
              disabled={!selectedCategoryId || filteredExams.length === 0}
            >
              {filteredExams.map((exam) => (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.examName}
                </MenuItem>
              ))}
              {filteredExams.length === 0 && (
                <MenuItem disabled>No exams available in this category</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <TextField
        label="Filter by Name or Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sno</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>No Face Count</TableCell>
              <TableCell>Multiple Face Count</TableCell>
              <TableCell>Cell Phone Count</TableCell>
              <TableCell>Prohibited Object Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((log, index) => (
              <TableRow key={log._id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.email}</TableCell>
                <TableCell>{log.noFaceCount}</TableCell>
                <TableCell>{log.multipleFaceCount}</TableCell>
                <TableCell>{log.cellPhoneCount}</TableCell>
                <TableCell>{log.prohibitedObjectCount}</TableCell>
                <TableCell>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Tooltip title="Delete attempt">
                        <IconButton
                          color="error"
                          onClick={async () => {
                            const ok = window.confirm(
                              `Delete cheating log for ${log.username}? This action cannot be undone.`,
                            );
                            if (!ok) return;
                            if (!log._id) {
                              window.alert('Cannot delete: missing log id');
                              return;
                            }
                            try {
                              await deleteCheatingLog({ id: log._id, examId: selectedExamId }).unwrap();
                              setCheatingLogs((prev) => prev.filter((l) => l._id !== log._id));
                            } catch (err) {
                              console.error('Delete failed', err);
                              window.alert('Failed to delete attempt. See console for details.');
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Unblock student">
                        <IconButton
                          color="primary"
                          onClick={async () => {
                            if (!log.email) {
                              window.alert('Cannot unblock: missing student email in log');
                              return;
                            }
                            try {
                              await unblockUser({ email: log.email, resetCount: true }).unwrap();
                              window.alert(`Unblocked ${log.username || log.email}`);
                            } catch (err) {
                              console.error('Unblock failed', err);
                              window.alert('Failed to unblock student. See console for details.');
                            }
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 600 }}>UNBLOCK</span>
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
