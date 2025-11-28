import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  List,
  ListItemText,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetExamsQuery, useValidateExamAccessMutation } from 'src/slices/examApiSlice';
import { useSelector } from 'react-redux';
import ExamDetailsView from '../teacher/ExamDetailsView';

// removed unused copyright helper for compact file

const DescriptionAndInstructions = () => {
  const navigate = useNavigate();

  const { examId } = useParams();
  const { data: exams } = useGetExamsQuery();
  const exam = exams?.find((e) => e._id === examId);
  const [validateAccess, { isLoading: validating }] = useValidateExamAccessMutation();
  
  const [certify, setCertify] = useState(false);
  const testId = uniqueId();
  const [openPwd, setOpenPwd] = useState(false);
  const [code, setCode] = useState('');
  
  const handleCertifyChange = () => {
    setCertify(!certify);
  };
  
  const handleTest = () => {
    // If exam requires password, prompt first
    if (exam?.accessCode) {
      setOpenPwd(true);
      return;
    }
    navigate(`/exam/${examId}/${testId}`);
  };

  const submitCode = async () => {
    try {
      await validateAccess({ examId, code }).unwrap();
      setOpenPwd(false);
      navigate(`/exam/${examId}/${testId}`);
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Invalid exam password');
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" mb={1.5} fontWeight={700}>
          Description
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Short MCQ-based assessment. Read the key rules below and start when ready.
        </Typography>

        <>
          <Typography variant="h6" mb={1.5} mt={2} fontWeight={700}>
            Test Instructions
          </Typography>
          <List>
            <ol>
              <li>
                <ListItemText>
                  <Typography variant="body2">Only MCQ questions.</Typography>
                </ListItemText>
              </li>
              <li>
                <ListItemText>
                  <Typography variant="body2">Duration and question count as shown on exam card.</Typography>
                </ListItemText>
              </li>
              <li>
                <ListItemText>
                  <Typography variant="body2">Do not switch tabs during the test.</Typography>
                </ListItemText>
              </li>
              <li>
                <ListItemText>
                  <Typography variant="body2">Runs in fullscreen; stay in the test window.</Typography>
                </ListItemText>
              </li>
              <li>
                <ListItemText>
                  <Typography variant="body2">Answers save on Back/Next; you can revise within time.</Typography>
                </ListItemText>
              </li>
              <li>
                <ListItemText>
                  <Typography variant="body2">Submit before time ends to record your score.</Typography>
                </ListItemText>
              </li>
            </ol>
          </List>
        </>
        <Typography variant="h6" mb={1.5} mt={2} fontWeight={700}>
          Confirmation
        </Typography>
        <Typography variant="caption" color="text.secondary" mb={2} display="block">
          The test is proctored. Misconduct may lead to suspension or cancellation.
        </Typography>
        <Stack direction="column" alignItems="center" spacing={3}>
          <FormControlLabel
            control={<Checkbox checked={certify} onChange={handleCertifyChange} color="primary" />}
            label="I certify that I have carefully read and agree to all of the instructions mentioned above"
          />
          <Button variant="contained" color="primary" size="small" disabled={!certify} onClick={handleTest}>
            Start Test
          </Button>
        </Stack>
        <Dialog open={openPwd} onClose={() => setOpenPwd(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Enter Exam Password</DialogTitle>
          <DialogContent>
            <TextField
              label="Password"
              type="password"
              fullWidth
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPwd(false)}>Cancel</Button>
            <Button onClick={submitCode} variant="contained" disabled={validating || !code}>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const imgUrl =
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

export default function ExamDetails() {
  const { userInfo } = useSelector((state) => state.auth);

  // If user is a teacher, show the teacher view
  if (userInfo?.role === 'teacher') {
    return <ExamDetailsView />;
  }

  // Otherwise show the student test-taking view
  return (
    <>
      <Grid container sx={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${imgUrl})`, // 'url(https://source.unsplash.com/random?wallpapers)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <DescriptionAndInstructions />
        </Grid>
      </Grid>
    </>
  );
}
