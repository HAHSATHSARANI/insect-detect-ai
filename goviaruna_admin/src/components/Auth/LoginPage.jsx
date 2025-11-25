// src/components/Auth/LoginPage.jsx

import React from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
    Avatar,
    Link,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";

export const LoginPage = ({
    loginData,
    setLoginData,
    handleLogin,
    onBackClick,
    onSignupClick,
    loginError,
}) => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#f3f4f6",
                zIndex: 1200,
            }}
        >
            <Card
                sx={{
                    width: 420,
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    bgcolor: 'white',
                }}
            >
                <CardContent sx={{ p: 5, textAlign: 'center' }}>
                    {/* Icon */}
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            bgcolor: '#10b981',
                            margin: '0 auto',
                            mb: 3,
                        }}
                    >
                        <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Avatar>

                    {/* Title */}
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: '#111827',
                            fontSize: '1.75rem'
                        }}
                    >
                        Sign In
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 4,
                            color: '#6b7280',
                            fontSize: '0.875rem'
                        }}
                    >
                        Log in to your InsectAI dashboard
                    </Typography>

                    {/* Email */}
                    <TextField
                        placeholder="Email"
                        fullWidth
                        variant="outlined"
                        value={loginData.email}
                        onChange={(e) =>
                            setLoginData({ ...loginData, email: e.target.value })
                        }
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: '#fafafa',
                                '& fieldset': {
                                    borderColor: '#e5e7eb',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#10b981',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#10b981',
                                },
                            },
                        }}
                    />

                    {/* Password */}
                    <TextField
                        placeholder="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={loginData.password}
                        onChange={(e) =>
                            setLoginData({
                                ...loginData,
                                password: e.target.value,
                            })
                        }
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: '#fafafa',
                                '& fieldset': {
                                    borderColor: '#e5e7eb',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#10b981',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#10b981',
                                },
                            },
                        }}
                    />

                    {/* Error Message */}
                    {loginError && (
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 2,
                                color: '#dc2626',
                                fontSize: '0.875rem'
                            }}
                        >
                            {loginError}
                        </Typography>
                    )}

                    {/* Login Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        sx={{
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            mb: 3,
                            bgcolor: '#10b981',
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#059669',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Sign In
                    </Button>

                    {/* Signup Link */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            component="span"
                            sx={{ color: '#6b7280', fontSize: '0.875rem' }}
                        >
                            Don't have an account?{' '}
                        </Typography>
                        <Link
                            component="button"
                            onClick={onSignupClick}
                            sx={{
                                color: '#10b981',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Sign up
                        </Link>
                    </Box>

                    {/* Back to Home Link */}
                    <Link
                        component="button"
                        onClick={onBackClick}
                        sx={{
                            color: '#10b981',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Back to Home
                    </Link>
                </CardContent>
            </Card>
        </Box>
    );
};
