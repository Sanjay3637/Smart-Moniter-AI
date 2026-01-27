import React, { useState } from 'react';
import { Box, Card, Typography, Stack, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import PageContainer from 'src/components/container/PageContainer';
import AuthBackground from './auth/AuthBackground';
import AuthFeatures from './auth/AuthFeatures';
import { useForgotPasswordMutation, useResetPasswordMutation } from 'src/slices/usersApiSlice';
import Loader from './Loader';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Identity, 2: OTP, 3: Reset
    const [identifier, setIdentifier] = useState(''); // email or rollNumber
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!identifier) return toast.error('Please enter your Email or Roll Number');

        try {
            const isEmail = identifier.includes('@');
            const payload = isEmail ? { email: identifier } : { rollNumber: identifier };
            await forgotPassword(payload).unwrap();
            toast.success('OTP sent to your registered email');
            setStep(2);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP');
        setStep(3);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

        try {
            const isEmail = identifier.includes('@');
            const payload = {
                otp,
                newPassword,
                ...(isEmail ? { email: identifier } : { rollNumber: identifier })
            };
            await resetPassword(payload).unwrap();
            toast.success('Password reset successful! Please login.');
            navigate('/auth/login');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <PageContainer title="Forgot Password" description="Reset your password">
            <Box sx={{ position: 'relative' }}>
                <AuthBackground />
                <AuthFeatures role="general" />
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{ height: '100vh', position: 'relative', zIndex: 10, px: 2 }}
                >
                    <Card
                        elevation={0}
                        sx={{
                            p: { xs: 4, sm: 6 },
                            width: '100%',
                            maxWidth: '450px',
                            backdropFilter: 'blur(40px) saturate(180%)',
                            background: 'rgba(255, 255, 255, 0.92)',
                            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden'
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
                                background: 'linear-gradient(90deg, #1A237E, #5D87FF)',
                            }}
                        />

                        <Box display="flex" justifyContent="flex-start" mb={2}>
                            <Button
                                component={Link}
                                to="/auth/login"
                                variant="text"
                                color="primary"
                                size="small"
                                startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                sx={{ fontWeight: 700, textTransform: 'none', p: 0, opacity: 0.7, '&:hover': { opacity: 1, background: 'transparent' } }}
                            >
                                Back to Login
                            </Button>
                        </Box>

                        <Typography variant="h4" fontWeight={900} color="primary" mb={1} sx={{ letterSpacing: '-0.5px' }}>
                            Reset Password
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={4} fontWeight={600}>
                            {step === 1 && "Enter your credentials to receive a 6-digit OTP."}
                            {step === 2 && `An OTP has been sent to your email associated with ${identifier}.`}
                            {step === 3 && "Create a new strong password for your account."}
                        </Typography>

                        <form onSubmit={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleResetPassword}>
                            <Stack spacing={3}>
                                {step === 1 && (
                                    <TextField
                                        fullWidth
                                        label="Email or Roll Number"
                                        placeholder="e.g. 21BECE001 or name@exam.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                    />
                                )}

                                {step === 2 && (
                                    <TextField
                                        fullWidth
                                        label="6-Digit OTP"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        inputProps={{ style: { letterSpacing: otp ? '8px' : 'normal', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' } }}
                                    />
                                )}

                                {step === 3 && (
                                    <>
                                        <TextField
                                            fullWidth
                                            label="New Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Confirm Password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </>
                                )}

                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    type="submit"
                                    disabled={isSendingOtp || isResetting}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #1A237E 0%, #5D87FF 100%)',
                                        boxShadow: '0 10px 20px rgba(93, 135, 255, 0.2)',
                                        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 24px rgba(93, 135, 255, 0.3)' }
                                    }}
                                >
                                    {(isSendingOtp || isResetting) ? <Loader /> : (
                                        step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Update Password'
                                    )}
                                </Button>

                                {step === 2 && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                        sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
                                    >
                                        Didn't receive OTP? Resend
                                    </Button>
                                )}
                            </Stack>
                        </form>
                    </Card>
                </Stack>
            </Box>
        </PageContainer>
    );
};

export default ForgotPassword;
