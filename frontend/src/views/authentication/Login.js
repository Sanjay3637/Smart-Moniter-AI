import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Button, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import { useSelector } from 'react-redux';
import AuthBackground from './auth/AuthBackground';
import AuthFeatures from './auth/AuthFeatures';

// This page lets the user choose whether to login as student or teacher

const Login = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  return (
    <PageContainer title="Login" description="Choose login type">
      <AuthBackground />
      <AuthFeatures role="general" />

      <Grid
        container
        spacing={0}
        justifyContent="center"
        sx={{ height: '100vh', position: 'relative', zIndex: 10 }}
      >
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Card
            elevation={0}
            sx={{
              p: { xs: 6, sm: 8 }, // Slightly tighter for neatness
              zIndex: 1,
              width: '100%',
              maxWidth: '540px',
              borderRadius: 0,
              backdropFilter: 'blur(40px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.92)',
              boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Top accent line */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1A237E, #0D47A1)',
              }}
            />

            <Typography
              variant="h3"
              fontWeight={900}
              color="primary"
              mb={1.5}
              sx={{
                letterSpacing: '-1px',
                textTransform: 'uppercase'
              }}
            >
              Smart - Monitor
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={6} sx={{ fontWeight: 600, opacity: 0.7 }}>
              Next-Gen Autonomous Exam Proctoring
            </Typography>

            <Stack spacing={3}>
              <Button
                component={Link}
                to="/auth/login-student"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<SchoolIcon />}
                sx={{
                  py: 2,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 100%)',
                  borderRadius: 0,
                  boxShadow: '0 10px 20px rgba(13, 71, 161, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 25px rgba(13, 71, 161, 0.4)',
                  }
                }}
              >
                Launch Student Portal
              </Button>

              <Button
                component={Link}
                to="/auth/login-teacher"
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<PersonOutlineIcon />}
                sx={{
                  py: 2,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  borderWidth: '2px',
                  borderRadius: 0,
                  color: '#1A237E',
                  borderColor: '#1A237E',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)',
                    bgcolor: 'rgba(26, 35, 126, 0.05)',
                    borderColor: '#0D47A1'
                  }
                }}
              >
                Access Faculty Hub
              </Button>
            </Stack>

            <Box mt={6} pt={4} sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, letterSpacing: '1px', opacity: 0.6, display: 'block', mb: 1 }}>
                ENCRYPTED SESSION ACTIVE • 256-BIT SECURITY
              </Typography>
              <Button
                component={Link}
                to="/auth/admin-login"
                variant="text"
                size="small"
                sx={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'primary.main',
                  opacity: 0.5,
                  '&:hover': { opacity: 1, background: 'transparent', textDecoration: 'underline' }
                }}
              >
                ADMIN PORTAL ACCESS
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Login;
