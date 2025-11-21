import React, { useState } from 'react';
import { Box, Card, Stack, TextField, Button, Typography, FormControlLabel, Checkbox } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { useUnblockUserMutation } from 'src/slices/usersApiSlice';
import { toast } from 'react-toastify';

const UnblockStudentPage = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [resetCount, setResetCount] = useState(true);
  const [loading, setLoading] = useState(false);
  const [unblockUser] = useUnblockUserMutation();

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
