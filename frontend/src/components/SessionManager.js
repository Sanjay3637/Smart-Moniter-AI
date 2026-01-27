import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from 'src/slices/authSlice';
import { useLogoutMutation } from 'src/slices/usersApiSlice';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

const SessionManager = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const [logoutApiCall] = useLogoutMutation();

    // Settings
    const WARNING_TIME = 10 * 60 * 1000; // 10 minutes
    const LOGOUT_TIME = 15 * 60 * 1000;  // 15 minutes

    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const [modalConfig, setModalConfig] = useState({
        open: false,
        type: 'warning', // 'warning' | 'logout' | 'fresh'
        title: '',
        message: ''
    });

    const closeDialog = () => {
        setModalConfig({ ...modalConfig, open: false });
        resetTimer(); // activity on close
    };

    // --- 1. Tab Close / New Tab Logic ---
    useEffect(() => {
        // ... (existing tab sync logic kept conceptually, simplified for brevity here if duplicated, but I will preserve logic)
        // Re-implementing logic to ensure we don't lose it.
        const channel = new BroadcastChannel('app_session_sync');
        const sessionActive = sessionStorage.getItem('app_session_active');

        if (!sessionActive && userInfo) {
            let otherTabsAlive = false;
            const handlePong = () => otherTabsAlive = true;
            channel.addEventListener('message', (e) => { if (e.data === 'PONG') handlePong(); });
            channel.postMessage('PING');
            setTimeout(() => {
                if (!otherTabsAlive) {
                    console.log('Fresh tab and no other tabs detected. Logging out.');
                    // handleLogout('Session expired. Please login again.', 'fresh'); 
                    // We can't call handleLogout easily here due to deps/scope. 
                    // But we can trigger immediate logout.
                    forceLogout('Session expired. Please login again.');
                } else {
                    sessionStorage.setItem('app_session_active', 'true');
                }
            }, 500);
        } else if (userInfo) {
            sessionStorage.setItem('app_session_active', 'true');
        }

        channel.addEventListener('message', (e) => {
            if (e.data === 'PING' && localStorage.getItem('userInfo')) {
                channel.postMessage('PONG');
            }
        });

        return () => channel.close();
        // eslint-disable-next-line
    }, [userInfo]);


    // --- 2. Inactivity Timer Logic ---
    const forceLogout = async (msg) => {
        try { await logoutApiCall().unwrap(); } catch (err) { }
        dispatch(logout());
        sessionStorage.removeItem('app_session_active');

        // Show Logout Modal
        setModalConfig({
            open: true,
            type: 'logout',
            title: 'Session Expired',
            message: msg || "You have been logged out due to inactivity."
        });
        // We do typically navigate to login, but if we show a modal, we might want to wait for user to click OK?
        // Or navigate immediately and show modal on login page? 
        // Showing modal on top of current view then redirecting on close is better UX.
    };

    const handleLogout = (msg) => {
        forceLogout(msg);
    };

    const resetTimer = () => {
        if (!userInfo) return;
        lastActivityRef.current = Date.now();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);

        // Set Warning Timer
        warningRef.current = setTimeout(() => {
            setModalConfig({
                open: true,
                type: 'warning',
                title: 'Inactivity Warning',
                message: "You have been inactive for 10 minutes. You will be logged out in 5 minutes."
            });
        }, WARNING_TIME);

        // Set Logout Timer
        timeoutRef.current = setTimeout(() => {
            handleLogout("You were inactive for 15 minutes.");
        }, LOGOUT_TIME);
    };

    useEffect(() => {
        if (!userInfo) return;
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        resetTimer();

        let throttleTimer;
        const handleActivity = () => {
            // If modal is open (especially logout), don't reset timer
            if (modalConfig.open && modalConfig.type === 'logout') return;

            if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    // Only reset if we are not in logout state
                    if (modalConfig.type !== 'logout') {
                        resetTimer();
                        // If warning was open, close it automatically on activity?
                        // User requirement: "alert should display". 
                        // Usually activity should dismiss warning.
                        if (modalConfig.open && modalConfig.type === 'warning') {
                            setModalConfig(prev => ({ ...prev, open: false }));
                        }
                    }
                    throttleTimer = null;
                }, 1000);
            }
        };

        events.forEach(event => window.addEventListener(event, handleActivity));
        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
        // eslint-disable-next-line
    }, [userInfo, modalConfig.open, modalConfig.type]);

    const handleClose = () => {
        setModalConfig({ ...modalConfig, open: false });
        if (modalConfig.type === 'logout' || modalConfig.type === 'fresh') {
            navigate('/auth/login');
        }
    };

    return (
        <>
            {children}
            <Dialog
                open={modalConfig.open}
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                    {modalConfig.type === 'warning' ? (
                        <WarningAmberRoundedIcon sx={{ fontSize: 60, color: 'warning.main', mb: 1 }} />
                    ) : (
                        <AccessTimeFilledIcon sx={{ fontSize: 60, color: 'error.main', mb: 1 }} />
                    )}
                    <Typography variant="h5" fontWeight={700}>
                        {modalConfig.title}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        {modalConfig.message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        color={modalConfig.type === 'warning' ? 'warning' : 'primary'}
                        onClick={handleClose}
                        size="large"
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {modalConfig.type === 'warning' ? "I'm Here" : "Login Again"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SessionManager;
