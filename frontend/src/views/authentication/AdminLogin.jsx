import React, { useEffect } from 'react';
import { Grid, Box, Card, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
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
                {/* Simple shield/lock illustration */}
                <Box component="svg" width={86} height={72} viewBox="0 0 128 96">
                  <path d="M64 8l40 12v28c0 24-40 32-40 32S24 72 24 48V20l40-12z" fill="#111827"/>
                  <path d="M64 40a10 10 0 0110 10v6H54v-6a10 10 0 0110-10z" fill="#f59e0b"/>
                  <rect x="58" y="56" width="12" height="10" rx="2" fill="#fde68a" />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={700} textAlign="center" mb={1}>Admin Login</Typography>
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
