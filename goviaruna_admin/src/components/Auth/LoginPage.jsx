// src/components/Auth/LoginPage.jsx

import React from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

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
                background: "#f3f4f6",
                zIndex: 1200,
            }}
        >
            <Card
                sx={{
                    width: 380,
                    borderRadius: 3,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Title */}
                    <Typography
                        variant="h5"
                        align="center"
                        fontWeight={600}
                        sx={{ mb: 3 }}
                    >
                        Welcome Back
                    </Typography>

                    {/* Email */}
                    <TextField
                        label="Email"
                        fullWidth
                        variant="outlined"
                        value={loginData.email}
                        onChange={(e) =>
                            setLoginData({ ...loginData, email: e.target.value })
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* Password */}
                    <TextField
                        label="Password"
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
                        sx={{ mb: 2 }}
                    />

                    {/* Error Message */}
                    {loginError && (
                        <Typography
                            variant="body2"
                            color="error"
                            sx={{ mb: 2, textAlign: "center" }}
                        >
                            {loginError}
                        </Typography>
                    )}

                    {/* Login Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<LoginIcon />}
                        onClick={handleLogin}
                        sx={{
                            py: 1.2,
                            fontWeight: 600,
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        Sign In
                    </Button>

                    {/* Signup Link */}
                    <Button
                        fullWidth
                        variant="text"
                        onClick={onSignupClick}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Create an account
                    </Button>

                    {/* Back Button */}
                    <Button
                        fullWidth
                        variant="text"
                        color="secondary"
                        onClick={onBackClick}
                        sx={{ textTransform: "none", mt: 1 }}
                    >
                        Back
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};
