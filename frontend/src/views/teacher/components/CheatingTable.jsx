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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetExamsQuery } from 'src/slices/examApiSlice';
import { useGetCheatingLogsQuery } from 'src/slices/cheatingLogApiSlice';
import { useDeleteCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';

export default function CheatingTable() {
  const [filter, setFilter] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [cheatingLogs, setCheatingLogs] = useState([]);

  const { data: examsData } = useGetExamsQuery();
  const { data: cheatingLogsData } = useGetCheatingLogsQuery(selectedExamId);
  const [deleteCheatingLog] = useDeleteCheatingLogMutation();

  useEffect(() => {
    if (examsData && examsData.length > 0) {
      setSelectedExamId(examsData[0]._id);
    }
  }, [examsData]);

  useEffect(() => {
    if (cheatingLogsData) {
      setCheatingLogs(cheatingLogsData);
    }
  }, [cheatingLogsData]);

  const filteredUsers = cheatingLogs.filter(
    (log) =>
      log.username.toLowerCase().includes(filter.toLowerCase()) ||
      log.email.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Box>
      <Select
        label="Select Exam"
        value={selectedExamId}
        onChange={(e) => {
          setSelectedExamId(e.target.value);
        }}
        fullWidth
        sx={{ mb: 2 }}
      >
        {examsData &&
          examsData.map((exam) => (
            <MenuItem key={exam._id} value={exam._id}>
              {exam.examName}
            </MenuItem>
          ))}
      </Select>
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
                          await deleteCheatingLog(log._id).unwrap();
                          // refetch will be handled by RTK Query invalidation; also update local state optimistically
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
