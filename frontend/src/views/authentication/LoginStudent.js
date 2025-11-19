import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Dialog, DialogTitle, DialogContent, Button } from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthLogin from './auth/AuthLogin';

import { useFormik } from 'formik';
import * as yup from 'yup';

import { useDispatch, useSelector } from 'react-redux';

import { useLoginMutation } from './../../slices/usersApiSlice';

import { setCredentials } from './../../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';

const userValidationSchema = yup.object({
  rollNumber: yup.string().required('Roll number is required'),
  password: yup.string().min(6, 'Password should be of minimum 6 characters').required('Password is required'),
});
const initialUserValues = {
  rollNumber: '',
  password: '',
};

const LoginStudent = () => {
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [blockedText, setBlockedText] = useState('');
  const formik = useFormik({
    initialValues: initialUserValues,
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const handleSubmit = async ({ rollNumber, password }) => {
    try {
      const res = await login({ rollNumber, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      formik.resetForm();
      navigate('/');
    } catch (err) {
      const status = err?.status;
      const msg = err?.data?.message || err.error || 'Login failed';
      if (status === 403) {
        setBlockedText('You have been blocked due to malpractice. Please contact your teacher to get unblocked.');
        setBlockedOpen(true);
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <PageContainer title="Student Login" description="Student login page">
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid item xs={12} sm={12} lg={4} xl={3} display="flex" justifyContent="center" alignItems="center">
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <AuthLogin
                formik={formik}
                usernameFieldName="rollNumber"
                usernameLabel="Roll Number"
                placeholder="Enter Your Roll Number"
                subtext={
                  <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1}>
                    CONDUCT SECURE ONLINE EXAMS NOW
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="500">
                      New to Modernize?
                    </Typography>
                    <Typography component={Link} to="/auth/register?role=student" fontWeight="500" sx={{ textDecoration: 'none', color: 'primary.main' }}>
                      Create an account
                    </Typography>
                    {isLoading && <Loader />}
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={blockedOpen} onClose={() => setBlockedOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Access Blocked
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={2}>
            <Typography variant="h6" gutterBottom>
              {blockedText}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Contact your teacher to be unblocked and retake future tests.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setBlockedOpen(false)}>
              OK
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default LoginStudent;
