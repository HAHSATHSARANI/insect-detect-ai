// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Container, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { People as PeopleIcon, BugReport as BugReportIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

    const [adminUsers, setAdminUsers] = useState([]);
    const [insects, setInsects] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [adminsRes, insectsRes] = await Promise.all([
                    fetch(`${API}/admins`),
                    fetch(`${API}/insects`)
                ]);

                if (adminsRes.ok) {
                    const adminsData = await adminsRes.json();
                    setAdminUsers(adminsData);
                }

                if (insectsRes.ok) {
                    const insectsData = await insectsRes.json();
                    setInsects(insectsData);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
            }
        };

        fetchData();
    }, [API]);

    if (error) {
        return (
            <Box sx={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, paddingRight: '20px', bgcolor: '#f5f7fa', overflow: 'auto' }}>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Typography variant="h6" color="error">
                        Error loading dashboard: {error}
                    </Typography>
                </Container>
            </Box>
        );
    }

    const totalUsers = adminUsers.length;
    const totalInsects = insects.length;

    const avgConfidence = totalInsects > 0
        ? insects.reduce((sum, i) => sum + (i.confidence || 0), 0) / totalInsects
        : 0;

    const recentUsersCount = Math.min(adminUsers.filter(u => u.isActive).length, 4);

    const categoryDistribution = insects.reduce((acc, insect) => {
        const category = insect.category || 'Unknown';
        if (!acc[category]) {
            acc[category] = { name: category, value: 0 };
        }
        acc[category].value += 1;
        return acc;
    }, {});

    const categoryData = Object.values(categoryDistribution);
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);

    // Generate random top species data for demo purposes
    const topSpecies = [...insects]
        .map(insect => ({
            name: insect.name,
            category: insect.category,
            detections: Math.floor(Math.random() * 1200) + 100, // Random count between 100 and 1300
            confidence: 0
        }))
        .sort((a, b) => b.detections - a.detections)
        .slice(0, 5);

    // Find max detections to scale the bars
    const maxDetections = Math.max(...topSpecies.map(s => s.detections), 100);

    const recentUsers = adminUsers.slice(0, 3).map((user, idx) => {
        const timeOptions = ["2h ago", "5h ago", "1d ago", "3d ago", "4h ago"];
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            lastActive: timeOptions[idx % timeOptions.length],
            status: user.isActive ? "Active" : "Inactive"
        };
    });

    const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#0d9488'];

    const stats = [
        { title: 'Total Users', value: totalUsers, subtitle: 'Registered users', icon: <PeopleIcon /> },
        { title: 'AI Model Accuracy', value: `${avgConfidence.toFixed(1)}%`, subtitle: 'Current accuracy', icon: <TrendingUpIcon /> },
        { title: 'Recent Users', value: recentUsersCount, subtitle: 'Last 24 hours', icon: <TrendingUpIcon /> },
        { title: 'Total Insects', value: totalInsects, subtitle: 'Species recorded', icon: <BugReportIcon /> },
    ];

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, paddingRight: '20px', bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', fontSize: '2rem' }}>
                        Dashboard
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 4 }}>
                    {stats.map((stat, idx) => (
                        <Card key={idx} sx={{
                            bgcolor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            borderRadius: 3,
                            border: '1px solid #f0f0f0',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem' }}>
                                        {stat.title}
                                    </Typography>
                                    <Box sx={{ color: '#10b981', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '2.5rem', lineHeight: 1 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.813rem' }}>
                                    {stat.subtitle}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Card sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827', fontSize: '1.125rem' }}>
                                Species Category Distribution
                            </Typography>
                            <Box sx={{ width: '100%', height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 2 }}>
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={120}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [`${value} Insects`, name]}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                formatter={(value, entry) => {
                                                    const { payload } = entry;
                                                    return <span style={{ color: '#374151', fontWeight: 500, marginLeft: 5 }}>{value} ({payload.value})</span>;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No species data available
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827', fontSize: '1.125rem' }}>
                                    Top Species Performance
                                </Typography>
                                <Box sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', py: 1 }}>
                                    {topSpecies.length > 0 ? (
                                        <>
                                            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', pr: 1 }}>
                                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>{maxDetections}</Typography>
                                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>{Math.round(maxDetections * 0.75)}</Typography>
                                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>{Math.round(maxDetections * 0.5)}</Typography>
                                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>{Math.round(maxDetections * 0.25)}</Typography>
                                                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>0</Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', height: 150, ml: 5, mr: 1 }}>
                                                {topSpecies.map((species, idx) => {
                                                    const heightPercent = ((species.detections || 0) / maxDetections) * 100;
                                                    return (
                                                        <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', flex: 1, mx: 0.5 }}>
                                                            <Box
                                                                sx={{
                                                                    width: '100%',
                                                                    maxWidth: 70,
                                                                    height: `${heightPercent * 0.8}%`,
                                                                    minHeight: '4px',
                                                                    bgcolor: '#10b981',
                                                                    borderRadius: '6px 6px 0 0',
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        bgcolor: '#059669',
                                                                    }
                                                                }}
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    mt: 1,
                                                                    color: '#6b7280',
                                                                    fontSize: '0.75rem',
                                                                    textAlign: 'center',
                                                                    fontWeight: 500,
                                                                    height: '2.5em', // Fixed height for 2 lines
                                                                    display: '-webkit-box',
                                                                    overflow: 'hidden',
                                                                    WebkitBoxOrient: 'vertical',
                                                                    WebkitLineClamp: 2,
                                                                    lineHeight: 1.2
                                                                }}
                                                            >
                                                                {species.name.split(' ').slice(0, 2).join(' ')}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No species data available
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827', fontSize: '1.125rem' }}>
                                    Recent Active Users
                                </Typography>
                                {recentUsers.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#fafafa' }}>
                                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', py: 1, border: 'none' }}>User</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', py: 1, border: 'none' }}>Last Active</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', py: 1, border: 'none' }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recentUsers.map((user) => (
                                                    <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                                        <TableCell sx={{ py: 1.25, border: 'none' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        bgcolor: '#10b981',
                                                                        width: 32,
                                                                        height: 32,
                                                                        fontSize: 14,
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    {user.name?.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight={500} sx={{ color: '#111827', fontSize: '0.875rem' }}>
                                                                    {user.name}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, border: 'none' }}>
                                                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                                {user.lastActive}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, border: 'none' }}>
                                                            <Chip
                                                                label={user.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: user.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                                                                    color: user.status === 'Active' ? '#065f46' : '#6b7280',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem',
                                                                    borderRadius: '16px',
                                                                    height: '24px',
                                                                    px: 1
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No recent user activity
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};