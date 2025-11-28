import React, { useEffect } from 'react';
import { Grid, Box, Card, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthLogin from './auth/AuthLogin';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const AdminLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) navigate('/admin');
  }, [navigate]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: ({ email, password }) => {
      if (email === 'admin@collage.com' && password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        toast.success('Admin login successful');
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials');
      }
    },
  });

  return (
    <PageContainer title="Admin Login" description="Admin login page">
      <Box sx={{ position: 'relative' }}>
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid item xs={12} sm={12} lg={4} xl={3} display="flex" justifyContent="center" alignItems="center">
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <AuthLogin
                formik={formik}
                usernameFieldName="email"
                usernameLabel="Email"
                placeholder="Enter Your Email"
                subtext={
                  <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1}>
                    ADMIN ACCESS ONLY
                  </Typography>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default AdminLogin;
