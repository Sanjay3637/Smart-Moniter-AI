import React, { useEffect, useState } from 'react';
import { Box, Card, Stack, TextField, Button, Typography, FormControlLabel, Checkbox, Divider, List, ListItem, ListItemText, Chip, Grid } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { useUnblockUserMutation, useLazyGetStudentByIdentifierQuery, useLazyGetStudentHistoryQuery } from 'src/slices/usersApiSlice';
import { toast } from 'react-toastify';

const UnblockStudentPage = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [resetCount, setResetCount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unblockUser] = useUnblockUserMutation();
  const [triggerLookup, { data: studentInfo, isFetching: isLookupLoading }] = useLazyGetStudentByIdentifierQuery();
  const [triggerHistory, { data: historyData, isFetching: isHistoryLoading }] = useLazyGetStudentHistoryQuery();

  useEffect(() => {
    const rn = rollNumber.trim();
    if (!rn) return;
    const id = setTimeout(() => {
      triggerLookup({ rollNumber: rn });
      triggerHistory({ rollNumber: rn });
    }, 300);
    return () => clearTimeout(id);
  }, [rollNumber, triggerLookup]);

  const handleUnblock = async (e) => {
    e.preventDefault();
    if (!rollNumber?.trim()) {
      toast.error('Please enter a roll number');
      return;
    }
    try {
      setLoading(true);
      await unblockUser({ rollNumber: rollNumber.trim(), resetCount }).unwrap();
      toast.success(`Unblocked student with roll number: ${rollNumber.trim()}`);
      setRollNumber('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to unblock student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Unblock Student" description="Unblock a student by roll number">
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 4 }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2} component="form" onSubmit={handleUnblock}>
            <Typography variant="h5">Unblock Student</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter the student's roll number to unblock their account. Optionally reset malpractice count.
            </Typography>
            <TextField
              label="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              fullWidth
            />
            {rollNumber?.trim() && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isLookupLoading ? 'Fetching student info...' : studentInfo ? `Current malpractice count: ${studentInfo.malpracticeCount || 0} (${studentInfo.isBlocked ? 'Blocked' : 'Active'})` : 'No student found for this roll number'}
                </Typography>
              </Box>
            )}
            {studentInfo && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1">Student History</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {isHistoryLoading ? 'Loading history...' : ''}
                </Typography>
                {historyData && (
                  <Stack spacing={2}>
                    <Card variant="outlined">
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2">Summary</Typography>
                        <Typography variant="body2" color="text.secondary">
                          No Face: {historyData.summary?.noFaceCount || 0} | Multiple Face: {historyData.summary?.multipleFaceCount || 0} | Phone: {historyData.summary?.cellPhoneCount || 0} | Prohibited: {historyData.summary?.prohibitedObjectCount || 0} | Events: {historyData.summary?.events || 0}
                        </Typography>
                      </Box>
                    </Card>
                    <Card variant="outlined">
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Actions</Typography>
                        {historyData.actionLogs?.length ? (
                          <List dense>
                            {historyData.actionLogs.map((a) => (
                              <ListItem key={a._id} disableGutters>
                                <ListItemText
                                  primary={`${a.action} ${a.metadata?.resetCount ? '(reset count)' : ''}`}
                                  secondary={new Date(a.createdAt).toLocaleString()}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No actions yet</Typography>
                        )}
                      </Box>
                    </Card>
                    <Card variant="outlined">
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Cheating Logs</Typography>
                        {historyData.cheatingLogs?.length ? (
                          <Stack spacing={2}>
                            {Object.entries(
                              historyData.cheatingLogs.reduce((acc, l) => {
                                const cat = l.categoryName || 'Uncategorized';
                                const ex = l.examName || l.examId;
                                if (!acc[cat]) acc[cat] = {};
                                if (!acc[cat][ex]) acc[cat][ex] = [];
                                acc[cat][ex].push(l);
                                return acc;
                              }, {})
                            ).map(([category, exams]) => (
                              <Box key={category}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>{category}</Typography>
                                <Grid container spacing={2}>
                                  {Object.entries(exams).map(([exam, logs]) => (
                                    <Grid item xs={12} key={exam}>
                                      <Card variant="outlined">
                                        <Box sx={{ p: 2 }}>
                                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{exam}</Typography>
                                            <Chip size="small" label={category} />
                                          </Stack>
                                          <List dense>
                                            {logs.map((l) => (
                                              <ListItem key={l._id} disableGutters>
                                                <ListItemText
                                                  primary={`NoFace ${l.noFaceCount || 0}, MultiFace ${l.multipleFaceCount || 0}, Phone ${l.cellPhoneCount || 0}, Prohibited ${l.prohibitedObjectCount || 0}`}
                                                  secondary={new Date(l.createdAt).toLocaleString()}
                                                  primaryTypographyProps={{ color: 'text.primary' }}
                                                  secondaryTypographyProps={{ color: 'text.secondary' }}
                                                />
                                              </ListItem>
                                            ))}
                                          </List>
                                        </Box>
                                      </Card>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No cheating logs found</Typography>
                        )}
                      </Box>
                    </Card>
                  </Stack>
                )}
              </Box>
            )}
            <FormControlLabel
              control={<Checkbox checked={resetCount} onChange={(e) => setResetCount(e.target.checked)} />}
              label="Reset malpractice count"
            />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Unblocking...' : 'Unblock'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default UnblockStudentPage;
