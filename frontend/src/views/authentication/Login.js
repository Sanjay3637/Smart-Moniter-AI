import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Button, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import { useSelector } from 'react-redux';

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
    <PageContainer title="Login" description="this is Login page">
      <Box>
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{
            height: '100vh',
            backgroundImage: [
              'radial-gradient(ellipse at 20% 10%, rgba(99,102,241,.35), transparent 35%)',
              'radial-gradient(ellipse at 80% 0%, rgba(16,185,129,.25), transparent 40%)',
              'radial-gradient(ellipse at 0% 80%, rgba(59,130,246,.25), transparent 35%)',
              "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
              "url('/login-bg.jpg')",
            ].join(', '),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 35%), ' +
                'radial-gradient(circle at 80% 30%, rgba(255,255,255,0.14), transparent 35%), ' +
                'radial-gradient(circle at 40% 80%, rgba(255,255,255,0.12), transparent 35%)',
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
              animation: 'bgfloat 18s ease-in-out infinite',
              backgroundSize: '200% 200%'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-radial-gradient(rgba(255,255,255,0.08) 0 2px, transparent 3px 60px)',
              opacity: 0.25,
              pointerEvents: 'none',
            },
            boxShadow: 'inset 0 -100px 200px rgba(0,0,0,.12)',
            '@keyframes bgfloat': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
          }}
        >
          <Grid
            item
            xs={12}
            sm={12}
            lg={4}
            xl={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                zIndex: 1,
                width: '100%',
                maxWidth: '520px',
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.65)',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="h5" fontWeight={700} textAlign="center" mt={1}>
                  Select Login Type
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
                  Welcome to SmartMonitor. Choose how you want to sign in.
                </Typography>
                <Divider sx={{ width: '100%', my: 1 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
                  <Button
                    component={Link}
                    to="/auth/login-student"
                    variant="contained"
                    fullWidth
                    startIcon={<SchoolIcon />}
                    sx={{ py: 1.25 }}
                  >
                    Student Login
                  </Button>
                  <Button
                    component={Link}
                    to="/auth/login-teacher"
                    variant="outlined"
                    fullWidth
                    startIcon={<PersonOutlineIcon />}
                    sx={{ py: 1.25, bgcolor: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}
                  >
                    Teacher Login
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" mt={2}>
                  By continuing, you agree to our Terms and Privacy Policy.
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login;
