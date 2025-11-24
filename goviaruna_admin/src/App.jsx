import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';

import { LandingPage } from './components/Landing/LandingPage';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AdminUsers } from './components/AdminUsers/AdminUsers';
import { AdminModal } from './components/AdminUsers/AdminModal';
import { FarmersPage } from './components/Farmers/FarmersPage';
import CommunityPage from './components/Community/CommunityPage';
import { AnalyticsPage } from './components/Analytics/AnalyticsPage';
import { SpeciesDatabase } from './components/SpeciesDatabase/SpeciesDatabase';

const App = () => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

    // Navigation & Auth
    // Initialize lazily from localStorage to prevent "flash" of landing page
    const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('user'));
    const [showLogin, setShowLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('user'));

    // Persist current page across refreshes
    const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('currentPage') || 'Dashboard');

    const [loggedInUser, setLoggedInUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // Admin Users
    const [adminUsers, setAdminUsers] = useState([]);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [adminFormData, setAdminFormData] = useState(null);

    // Insects
    const [insects, setInsects] = useState([]);
    const [showInsectModal, setShowInsectModal] = useState(false);
    const [editingInsect, setEditingInsect] = useState(null);
    const [insectFormData, setInsectFormData] = useState({
        name: '',
        scientificName: '',
        description: '',
        image: '',
        images: [],
        category: 'Butterfly',
        confidence: 95
    });

    // Persist currentPage to localStorage whenever it changes
    useEffect(() => {
        if (isLoggedIn) {
            localStorage.setItem('currentPage', currentPage);
        }
    }, [currentPage, isLoggedIn]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [adminsRes, insectsRes] = await Promise.all([
                    fetch(`${API}/admins`),
                    fetch(`${API}/insects`)
                ]);

                if (adminsRes.ok) setAdminUsers(await adminsRes.json());
                if (insectsRes.ok) setInsects(await insectsRes.json());
            } catch (err) {
                console.error('Failed to load initial data', err);
            }
        };
        loadData();
    }, [API]);

    // Analytics dummy data
    const detectionData = [
        { month: 'Jan', detections: 320 },
        { month: 'Feb', detections: 450 },
        { month: 'Mar', detections: 680 },
        { month: 'Apr', detections: 820 },
        { month: 'May', detections: 950 }
    ];

    // --------------------------
    // LOGIN — FIXED 100%
    // --------------------------
    const handleLogin = async () => {
        setLoginError("");

        if (!loginData.email || !loginData.password) {
            setLoginError("Please enter email & password");
            return;
        }

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            });

            const data = await res.json();
            console.log("Login Response:", data);

            if (!res.ok) {
                if (Array.isArray(data.detail)) {
                    const msg = data.detail.map(e => e.msg).join(", ");
                    setLoginError(msg || "Validation error");
                } else {
                    setLoginError(data.detail || "Login failed");
                }
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            setLoggedInUser(data);

            // Reset to Dashboard on fresh login
            localStorage.setItem("currentPage", "Dashboard");
            setCurrentPage("Dashboard");

            setIsLoggedIn(true);
            setShowLanding(false);
            setShowLogin(false);
        } catch (err) {
            console.error(err);
            setLoginError("Server error, try again");
        }
    };

    // --------------------------
    // SIGNUP
    // --------------------------
    const handleSignup = async () => {
        if (!signupData.name || !signupData.email || !signupData.password) return;

        try {
            const res = await fetch(`${API}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData)
            });

            if (!res.ok) {
                console.error("Signup failed:", await res.text());
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            setLoggedInUser(data);

            // Reset to Dashboard on fresh signup
            localStorage.setItem("currentPage", "Dashboard");
            setCurrentPage("Dashboard");

            setIsLoggedIn(true);
            setShowLanding(false);
            setShowLogin(false);
        } catch (err) {
            console.error("Signup error", err);
        }
    };

    // --------------------------
    // LOGOUT
    // --------------------------
    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setShowLanding(true);
        setShowLogin(true);
        setLoginData({ email: "", password: "" });
        setLoggedInUser(null);
        setCurrentPage("Dashboard"); // Reset state
    };

    // --------------------------
    // Admin/Insect CRUD
    // --------------------------
    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setAdminFormData(admin);
        setShowAdminModal(true);
    };

    const handleDeleteAdmin = async (id) => {
        try {
            const res = await fetch(`${API}/admins/${id}`, { method: "DELETE" });
            if (res.ok) setAdminUsers(prev => prev.filter(a => a.id !== id));
        } catch (err) { console.error(err); }
    };

    const handleSaveAdmin = async (adminData) => {
        try {
            if (editingAdmin) {
                const res = await fetch(`${API}/admins/${editingAdmin.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(adminData)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setAdminUsers(prev => prev.map(a => a.id === updated.id ? updated : a));
                }
            } else {
                const res = await fetch(`${API}/admins`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(adminData)
                });
                if (res.ok) {
                    const created = await res.json();
                    setAdminUsers(prev => [...prev, created]);
                }
            }
        } catch (err) { console.error(err); }
        setShowAdminModal(false);
        setEditingAdmin(null);
        setAdminFormData(null);
    };

    // Insects
    const handleSaveInsect = async () => {
        try {
            if (editingInsect) {
                const res = await fetch(`${API}/insects/${editingInsect.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(insectFormData)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setInsects(prev => prev.map(i => i.id === updated.id ? updated : i));
                }
            } else {
                const res = await fetch(`${API}/insects`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(insectFormData)
                });
                if (res.ok) {
                    const created = await res.json();
                    setInsects(prev => [...prev, created]);
                }
            }
        } catch (err) { console.error(err); }
        setShowInsectModal(false);
        setEditingInsect(null);
    };

    const handleEditInsect = (insect) => {
        setEditingInsect(insect);
        setInsectFormData({ ...insect });
        setShowInsectModal(true);
    };

    const handleDeleteInsect = async (id) => {
        try {
            const res = await fetch(`${API}/insects/${id}`, { method: "DELETE" });
            if (res.ok) setInsects(prev => prev.filter(i => i.id !== id));
        } catch (err) { console.error(err); }
    };

    // --------------------------
    // Render Logic
    // --------------------------
    if (showLanding) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LandingPage
                    onLoginClick={() => { setShowLanding(false); setShowLogin(true); }}
                    onSignupClick={() => { setShowLanding(false); setShowLogin(false); }}
                />
            </ThemeProvider>
        );
    }

    if (!isLoggedIn) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {showLogin ? (
                    <LoginPage
                        loginData={loginData}
                        setLoginData={setLoginData}
                        loginError={loginError}
                        handleLogin={handleLogin}
                        onSignupClick={() => setShowLogin(false)}
                        onBackClick={() => setShowLanding(true)}
                    />
                ) : (
                    <SignupPage
                        signupData={signupData}
                        setSignupData={setSignupData}
                        handleSignup={handleSignup}
                        onLoginClick={() => setShowLogin(true)}
                        onBackClick={() => setShowLanding(true)}
                    />
                )}
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MainLayout
                user={loggedInUser || { name: "Admin User", role: "Administrator", imageUrl: "" }}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onLogout={handleLogout}
            >
                {currentPage === "Dashboard" && (
                    <Dashboard
                        insects={insects}
                        detectionData={detectionData}
                        adminUsers={adminUsers}
                    />
                )}
                {currentPage === "Insects" && (
                    <SpeciesDatabase
                        insects={insects}
                        showInsectModal={showInsectModal}
                        setShowInsectModal={setShowInsectModal}
                        editingInsect={editingInsect}
                        setEditingInsect={setEditingInsect}
                        insectFormData={insectFormData}
                        setInsectFormData={setInsectFormData}
                        handleSaveInsect={handleSaveInsect}
                        handleEditInsect={handleEditInsect}
                        handleDeleteInsect={handleDeleteInsect}
                    />
                )}
                {currentPage === "Farmers" && <FarmersPage />}
                {currentPage === "Analytics" && (
                    <AnalyticsPage
                        detectionData={detectionData}
                        insects={insects}
                    />
                )}
                {currentPage === "Admins" && (
                    <>
                        <AdminUsers
                            adminUsers={adminUsers}
                            onEdit={handleEditAdmin}
                            onDelete={handleDeleteAdmin}
                            onAdd={() => {
                                setEditingAdmin(null);
                                setAdminFormData({ name: "", email: "", role: "Moderator", status: "Active" });
                                setShowAdminModal(true);
                            }}
                        />
                        <AdminModal
                            open={showAdminModal}
                            onClose={() => {
                                setShowAdminModal(false);
                                setEditingAdmin(null);
                                setAdminFormData(null);
                            }}
                            onSave={handleSaveAdmin}
                            isEditing={!!editingAdmin}
                            formData={adminFormData}
                        />
                    </>
                )}
                {currentPage === "Community" && <CommunityPage />}
            </MainLayout>
        </ThemeProvider>
    );
};

export default App;
