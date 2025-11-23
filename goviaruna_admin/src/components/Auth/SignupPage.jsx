// src/components/Auth/SignupPage.jsx
import { useState } from "react";
import { Box, Card, CardContent, TextField, Typography, Button } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const SignupPage = ({
    signupData,
    setSignupData,
    handleSignup,
    onLoginClick,
    onBackClick,
}) => {

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSignupClick = async () => {
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (signupData.password !== signupData.confirmPassword) {
            setErrorMsg("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: signupData.name,
                    email: signupData.email,
                    password: signupData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.error || "Signup failed, try again.");
            } else {
                // Backend returns token - store it and call parent handler
                localStorage.setItem('token', data.token);
                setSuccessMsg("Account created successfully!");
                // Call parent's handleSignup to update app state
                if (handleSignup) {
                    handleSignup();
                }
            }
        } catch (err) {
            setErrorMsg("Could not connect to server.");
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 440, width: '100%' }}>
                <CardContent
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            borderRadius: 2,
                            p: 2,
                            mb: 3,
                            display: 'inline-flex',
                        }}
                    >
                        <PersonAddIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>

                    <Typography variant="h4" gutterBottom align="center">
                        Get Started
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, textAlign: 'center' }}
                    >
                        Join InsectAI today
                    </Typography>

                    {/* Name */}
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={signupData.name}
                        onChange={(e) =>
                            setSignupData({ ...signupData, name: e.target.value })
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* Email */}
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                            setSignupData({ ...signupData, email: e.target.value })
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* Password */}
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                            setSignupData({ ...signupData, password: e.target.value })
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* Confirm Password */}
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={signupData.confirmPassword || ''}
                        onChange={(e) =>
                            setSignupData({
                                ...signupData,
                                confirmPassword: e.target.value,
                            })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                        sx={{ mb: 3 }}
                        error={
                            signupData.confirmPassword &&
                            signupData.confirmPassword !== signupData.password
                        }
                        helperText={
                            signupData.confirmPassword &&
                                signupData.confirmPassword !== signupData.password
                                ? 'Passwords do not match'
                                : ''
                        }
                    />

                    {/* Error Message */}
                    {errorMsg && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {errorMsg}
                        </Typography>
                    )}

                    {/* Success Message */}
                    {successMsg && (
                        <Typography color="success.main" sx={{ mb: 2 }}>
                            {successMsg}
                        </Typography>
                    )}

                    {/* Signup Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSignupClick}
                        disabled={
                            loading ||
                            !signupData.password ||
                            signupData.confirmPassword !== signupData.password
                        }
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </Button>

                    <Typography sx={{ mt: 2, textAlign: 'center' }}>
                        Already have an account?
                        <Button onClick={onLoginClick} sx={{ ml: 0.5 }}>
                            Sign in
                        </Button>
                    </Typography>

                    <Typography sx={{ textAlign: 'center' }}>
                        <Button onClick={onBackClick}>Back to Home</Button>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};
