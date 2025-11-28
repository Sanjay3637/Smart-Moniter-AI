import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography } from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import AuthLogin from './auth/AuthLogin';

import { useFormik } from 'formik';
import * as yup from 'yup';

import { useDispatch, useSelector } from 'react-redux';

import { useLoginMutation } from './../../slices/usersApiSlice';

import { setCredentials } from './../../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';

const userValidationSchema = yup.object({
  email: yup.string('Enter your email').email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password should be of minimum 6 characters').required('Password is required'),
});
const initialUserValues = {
  email: '',
  password: '',
};

const LoginTeacher = () => {
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

  const handleSubmit = async ({ email, password }) => {
    try {
      const res = await login({ email, password }).unwrap();

      dispatch(setCredentials({ ...res }));
      formik.resetForm();
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <PageContainer title="Teacher Login" description="Teacher login page">
      <Box sx={{ position: 'relative' }}>
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{
            height: '100vh',
            background: 'linear-gradient(180deg, #FFE29F 0%, #FFA99F 50%, #FFD6A5 100%)',
            backgroundAttachment: 'fixed',
          }}
        >
          <Grid item xs={12} sm={12} lg={4} xl={3} display="flex" justifyContent="center" alignItems="center">
            <Card elevation={6} sx={{ p: { xs: 3, sm: 4 }, zIndex: 1, width: '100%', maxWidth: '520px', borderRadius: 4, background: '#FFFFFF' }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                {/* Simple board icon illustration */}
                <Box component="svg" width={92} height={72} viewBox="0 0 128 96">
                  <rect x="12" y="18" width="104" height="56" rx="6" fill="#111827" />
                  <rect x="20" y="26" width="88" height="40" rx="4" fill="#334155" />
                  <rect x="58" y="76" width="12" height="8" fill="#9ca3af" />
                </Box>
              </Box>
              <AuthLogin
                formik={formik}
                usernameFieldName="email"
                usernameLabel="Email"
                placeholder="Enter Your Email"
                subtext={
                  <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1}>
                    CONDUCT SECURE ONLINE EXAMS NOW
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    {isLoading && <Loader />}
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default LoginTeacher;
