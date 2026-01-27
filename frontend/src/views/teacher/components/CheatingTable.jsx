import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Grid,
  Stack,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGetExamsQuery, useGetCategoriesQuery } from 'src/slices/examApiSlice';
import { useGetCheatingLogsQuery, useDeleteCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';

export default function CheatingTable() {
  const [searchParams] = useSearchParams();
  const urlExamId = searchParams.get('examId');
  const urlCategoryId = searchParams.get('categoryId');

  const [filter, setFilter] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(urlCategoryId || '');
  const [selectedExamId, setSelectedExamId] = useState(urlExamId || '');
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);

  // Gallery Dialog State
  const [openGallery, setOpenGallery] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: examsData } = useGetExamsQuery();
  const { data: cheatingLogsData, refetch: refetchCheatingLogs } = useGetCheatingLogsQuery(selectedExamId);
  const [deleteCheatingLog] = useDeleteCheatingLogMutation();

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));

  // Filter exams based on selected category
  useEffect(() => {
    if (examsData) {
      const filtered = selectedCategoryId
        ? examsData.filter(exam => exam.category?._id === selectedCategoryId)
        : [...examsData];
      const sorted = filtered.slice().sort((a, b) => String(a.examName || '').localeCompare(String(b.examName || '')));
      setFilteredExams(sorted);

      if (selectedExamId && !filtered.some(exam => exam._id === selectedExamId)) {
        setSelectedExamId('');
      }
    }
  }, [examsData, selectedCategoryId, selectedExamId]);

  // Set first category and exam by default
  useEffect(() => {
    if (categoriesData?.length > 0 && !selectedCategoryId) {
      const firstCategory = [...categoriesData].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))[0];
      if (firstCategory) setSelectedCategoryId(firstCategory._id);
    }
  }, [categoriesData, selectedCategoryId]);

  useEffect(() => {
    if (filteredExams.length > 0 && !selectedExamId) {
      setSelectedExamId(filteredExams[0]._id);
    }
  }, [filteredExams, selectedExamId]);

  useEffect(() => {
    if (selectedExamId) {
      refetchCheatingLogs();
    }
  }, [selectedExamId, refetchCheatingLogs]);

  useEffect(() => {
    if (cheatingLogsData) {
      const sortedLogs = cheatingLogsData
        .slice()
        .sort((a, b) => {
          const rollA = String(a.rollNumber || '').toLowerCase();
          const rollB = String(b.rollNumber || '').toLowerCase();
          if (rollA && rollB && rollA !== rollB) return rollA.localeCompare(rollB);
          const nameA = String(a.username || '').toLowerCase();
          const nameB = String(b.username || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      setCheatingLogs(sortedLogs);
    }
  }, [cheatingLogsData]);

  const filteredUsers = cheatingLogs.filter(
    (log) =>
      log.username?.toLowerCase().includes(filter.toLowerCase()) ||
      (log.rollNumber || '').toLowerCase().includes(filter.toLowerCase()),
  );

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
    { field: 'sno', headerName: 'SNO', width: 60, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Student Name', flex: 1, minWidth: 150 },
    { field: 'rollNumber', headerName: 'Roll Number', flex: 0.8, minWidth: 120 },
    { field: 'noFaceCount', headerName: 'No Face', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'multipleFaceCount', headerName: 'Multi Face', width: 95, align: 'center', headerAlign: 'center' },
    { field: 'cellPhoneCount', headerName: 'Phone', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'prohibitedObjectCount', headerName: 'Objects', width: 90, align: 'center', headerAlign: 'center' },
    {
      field: 'evidence', headerName: 'Evidence', width: 100, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: (params) => {
        const hasScreenshots = params.row.raw.screenshots?.length > 0;
        return (
          <Tooltip title={hasScreenshots ? "View malpractice screenshots" : "No evidence available"}>
            <span>
              <IconButton
                color="primary"
                disabled={!hasScreenshots}
                onClick={() => { setSelectedLog(params.row.raw); setOpenGallery(true); }}
                size="small"
              >
                <VisibilityIcon />
              </IconButton>
            </span>
          </Tooltip>
        );
      }
    },
    {
      field: 'actions', headerName: 'Actions', width: 80, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={async () => {
            const log = params.row.raw;
            if (window.confirm(`Delete log for ${log.username}?`)) {
              try {
                await deleteCheatingLog({ id: log._id, examId: selectedExamId }).unwrap();
                setCheatingLogs(prev => prev.filter(l => l._id !== log._id));
              } catch (err) { console.error(err); }
            }
          }}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    },
  ], [deleteCheatingLog, selectedExamId]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              label="Select Category"
            >
              {categoriesData?.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={!selectedCategoryId}>
            <InputLabel>Select Exam</InputLabel>
            <Select
              value={selectedExamId || ''}
              onChange={(e) => setSelectedExamId(e.target.value)}
              label="Select Exam"
            >
              {filteredExams.map(e => <MenuItem key={e._id} value={e._id}>{e.examName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TextField
        label="Search Student..."
        fullWidth
        variant="outlined"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Paper variant="outlined" sx={{ border: '1px solid rgba(26, 35, 126, 0.12)' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 100%)',
              color: 'white',
              '& .MuiDataGrid-columnSeparator': { display: 'none' },
              '& .MuiIconButton-root': { color: 'white' }
            },
            '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(26, 35, 126, 0.04)' }
          }}
        />
      </Paper>

      {/* Screenshot Gallery Dialog */}
      <Dialog
        open={openGallery}
        onClose={() => setOpenGallery(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" fontWeight={700}>Evidence Logs: {selectedLog?.username}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Roll: {selectedLog?.rollNumber}</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          {selectedLog?.screenshots?.length > 0 ? (
            <ImageList cols={isSmDown ? 1 : 2} gap={20}>
              {selectedLog.screenshots.map((item, idx) => (
                <ImageListItem key={idx} sx={{ border: '1px solid #eee' }}>
                  <img src={item.image} alt={item.type} loading="lazy" style={{ width: '100%', height: 'auto' }} />
                  <ImageListItemBar
                    title={_.startCase(item.type)}
                    subtitle={new Date(item.timestamp).toLocaleString()}
                    sx={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <Typography align="center" py={4} color="textSecondary">No screenshots captured.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <MuiButton onClick={() => setOpenGallery(false)} variant="contained">Close Gallery</MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
