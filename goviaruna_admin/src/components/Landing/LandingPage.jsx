// src/components/Landing/LandingPage.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export const LandingPage = ({ onLoginClick, onSignupClick }) => {
    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url("https://cdn.pixabay.com/photo/2023/01/27/13/24/green-7748695_1280.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#fff',
            }}
        >
            <Typography
                variant="h2"
                sx={{ fontWeight: 800, mb: 2, textShadow: '2px 2px 10px rgba(0,0,0,0.6)' }}
            >
                GoviAruna Admin
            </Typography>
            <Typography
                variant="h6"
                sx={{ mb: 5, maxWidth: 500, textShadow: '1px 1px 6px rgba(0,0,0,0.6)' }}
            >
                Empowering Sri Lankan paddy farmers with intelligent pest detection & eco-friendly solutions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={onLoginClick}
                    sx={{
                        bgcolor: '#10b981',
                        color: '#fff',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: '25px',
                        '&:hover': { bgcolor: '#059669' },
                    }}
                >
                    Login
                </Button>
                <Button
                    variant="outlined"
                    onClick={onSignupClick}
                    sx={{
                        borderColor: '#10b981',
                        color: '#fff',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: '25px',
                        '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.5)' },
                    }}
                >
                    Sign Up
                </Button>
            </Box>
        </Box>
    );
};
