import React from 'react';
import { Box } from '@mui/material';

const AuthBackground = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, #020617 0%, #051937 50%, #004d7a 100%)', // Crisp Blue Sky Gradient
            }}
        >
            {/* Animated Scanning Lines - more subtle */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent, rgba(93, 135, 255, 0.03), transparent)',
                    backgroundSize: '100% 400px',
                    animation: 'scan 10s linear infinite',
                    zIndex: 1,
                    '@keyframes scan': {
                        '0%': { backgroundPosition: '0 -400px' },
                        '100%': { backgroundPosition: '0 100vh' },
                    },
                }}
            />

            {/* Stars Layers */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {[...Array(120)].map((_, i) => (
                    <Box
                        key={`star-${i}`}
                        sx={{
                            position: 'absolute',
                            width: i % 3 === 0 ? '2px' : '1px',
                            height: i % 3 === 0 ? '2px' : '1px',
                            bgcolor: 'white',
                            borderRadius: '50%',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random(),
                            boxShadow: i % 5 === 0 ? '0 0 6px 1px rgba(255, 255, 255, 0.8)' : 'none',
                            animation: `twinkle ${2 + Math.random() * 5}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            '@keyframes twinkle': {
                                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                                '50%': { opacity: 1, transform: 'scale(1.2)' },
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default AuthBackground;
