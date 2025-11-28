import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, TextField, Select, MenuItem, IconButton, Tooltip, FormControl, InputLabel, Grid, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetExamsQuery, useGetCategoriesQuery } from 'src/slices/examApiSlice';
import { useGetCheatingLogsQuery } from 'src/slices/cheatingLogApiSlice';
import { useDeleteCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';

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
      (log.rollNumber || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const rows = useMemo(() => filteredUsers.map((log, idx) => ({
    id: log._id || `${idx}-${log.username}`,
    sno: idx + 1,
    name: log.username,
    rollNumber: log.rollNumber || '-',
    noFaceCount: log.noFaceCount,
    multipleFaceCount: log.multipleFaceCount,
    cellPhoneCount: log.cellPhoneCount,
    prohibitedObjectCount: log.prohibitedObjectCount,
    raw: log,
  })), [filteredUsers]);

  const columns = useMemo(() => [
    { field: 'sno', headerName: 'Sno', width: 70, flex: 0.3, minWidth: 60 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
    { field: 'rollNumber', headerName: 'Roll Number', flex: 0.8, minWidth: 140 },
    { field: 'noFaceCount', headerName: 'No Face', flex: 0.7, minWidth: 110, align: 'center', headerAlign: 'center' },
    { field: 'multipleFaceCount', headerName: 'Multiple Face', flex: 0.9, minWidth: 130, align: 'center', headerAlign: 'center' },
    { field: 'cellPhoneCount', headerName: 'Cell Phone', flex: 0.8, minWidth: 120, align: 'center', headerAlign: 'center' },
    { field: 'prohibitedObjectCount', headerName: 'Prohibited Object', flex: 1, minWidth: 150, align: 'center', headerAlign: 'center' },
    {
      field: 'actions', headerName: 'Actions', width: 110, sortable: false, filterable: false,
      renderCell: (params) => (
        <Tooltip title="Delete attempt">
          <IconButton
            color="error"
            onClick={async () => {
              const log = params.row.raw;
              const ok = window.confirm(`Delete cheating log for ${log.username}? This action cannot be undone.`);
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
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )
    },
  ], [deleteCheatingLog, selectedExamId]);

  // removed quick stat chips for cleaner UI

  return (
    <Box>
      <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: { xs: 1.5, md: 2 } }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size={isSmDown ? 'small' : 'medium'}>
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
          <FormControl fullWidth size={isSmDown ? 'small' : 'medium'}>
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
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 2 }} alignItems={{ xs: 'stretch', md: 'center' }} mb={{ xs: 1, md: 1.5 }}>
        <TextField
          label="Filter by Name or Roll Number"
          variant="outlined"
          size={isSmDown ? 'small' : 'medium'}
          fullWidth
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Stack>

      <Paper variant="outlined" sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: isSmDown ? 5 : 10 } } }}
          disableRowSelectionOnClick
          density={isSmDown ? 'compact' : 'standard'}
          autoHeight
          columnVisibilityModel={isSmDown ? { prohibitedObjectCount: false, cellPhoneCount: true } : undefined}
          rowHeight={isSmDown ? 52 : 64}
          columnHeaderHeight={isSmDown ? 52 : 60}
          sx={{
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover' },
            '& .MuiDataGrid-cell': { py: isSmDown ? 1 : 1.5 },
          }}
        />
      </Paper>
    </Box>
  );
}
