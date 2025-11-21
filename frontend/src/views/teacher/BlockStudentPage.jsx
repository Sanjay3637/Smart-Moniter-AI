import React, { useState } from 'react';
import { Box, Card, Stack, TextField, Button, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { useBlockUserMutation } from 'src/slices/usersApiSlice';
import { toast } from 'react-toastify';

const BlockStudentPage = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockUser] = useBlockUserMutation();

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!rollNumber?.trim()) {
      toast.error('Please enter a roll number');
      return;
    }
    try {
      setLoading(true);
      await blockUser({ rollNumber: rollNumber.trim() }).unwrap();
      toast.success(`Blocked student with roll number: ${rollNumber.trim()}`);
      setRollNumber('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to block student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Block Student" description="Block a student by roll number">
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 4 }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2} component="form" onSubmit={handleBlock}>
            <Typography variant="h5">Block Student</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter the student's roll number to block their account. They will not be able to log in until unblocked.
            </Typography>
            <TextField
              label="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Blocking...' : 'Block'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default BlockStudentPage;
