// src/components/Dashboard/Dashboard.jsx
import { useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, Paper,
    IconButton, LinearProgress, Container
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    BugReport as BugReportIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Visibility as VisibilityIcon,
    MoreVert as MoreIcon
} from '@mui/icons-material';

export const Dashboard = ({
    insects = [],
    detectionData = [],
    adminUsers = [],
    recentUsers = [],
    categoryDistributionData = []
}) => {
    const dummyInsects = [
        { id: 1, name: 'Monarch Butterfly', category: 'Butterfly', detections: 120, confidence: 92.5, status: 'Active' },
        { id: 2, name: 'Carpenter Ant', category: 'Ant', detections: 80, confidence: 89.3, status: 'Active' },
        { id: 3, name: 'Honey Bee', category: 'Bee', detections: 150, confidence: 95.1, status: 'Active' },
        { id: 4, name: 'Lady Beetle', category: 'Beetle', detections: 60, confidence: 87.8, status: 'Inactive' },
        { id: 5, name: 'Blue Dragonfly', category: 'Dragonfly', detections: 95, confidence: 90.6, status: 'Active' },
        { id: 6, name: 'Red Admiral', category: 'Butterfly', detections: 45, confidence: 88.2, status: 'Active' },
        { id: 7, name: 'Fire Ant', category: 'Ant', detections: 70, confidence: 91.5, status: 'Active' },
        { id: 8, name: 'Stag Beetle', category: 'Beetle', detections: 55, confidence: 86.9, status: 'Active' }
    ];

    const dummyRecentUsers = [
        { id: 1, name: 'Nimesha Dulanjalee', email: 'nimesha@example.com', detections: 45, lastActive: '2h ago', status: 'Active' },
        { id: 2, name: 'Sahan Dileepa', email: 'sahan@example.com', detections: 38, lastActive: '5h ago', status: 'Active' },
        { id: 3, name: 'Ishara Perera', email: 'ishara@example.com', detections: 29, lastActive: '1d ago', status: 'Inactive' },
        { id: 4, name: 'Tharindu Silva', email: 'tharindu@example.com', detections: 22, lastActive: '3d ago', status: 'Inactive' },
        { id: 5, name: 'Kavindi Fernando', email: 'kavindi@example.com', detections: 31, lastActive: '4h ago', status: 'Active' }
    ];

    const dummyDetectionData = [
        { id: 1, insectName: 'Monarch Butterfly', category: 'Butterfly', location: 'Garden A', confidence: 95.2, timestamp: '2024-11-22 10:30 AM', status: 'Verified' },
        { id: 2, insectName: 'Honey Bee', category: 'Bee', location: 'Field B', confidence: 98.7, timestamp: '2024-11-22 10:15 AM', status: 'Verified' },
        { id: 3, insectName: 'Carpenter Ant', category: 'Ant', location: 'Zone C', confidence: 89.4, timestamp: '2024-11-22 09:45 AM', status: 'Pending' },
        { id: 4, insectName: 'Lady Beetle', category: 'Beetle', location: 'Garden A', confidence: 92.1, timestamp: '2024-11-22 09:20 AM', status: 'Verified' },
        { id: 5, insectName: 'Blue Dragonfly', category: 'Dragonfly', location: 'Pond Area', confidence: 96.3, timestamp: '2024-11-22 08:55 AM', status: 'Verified' },
        { id: 6, insectName: 'Red Admiral', category: 'Butterfly', location: 'Garden B', confidence: 88.9, timestamp: '2024-11-22 08:30 AM', status: 'Verified' },
        { id: 7, insectName: 'Fire Ant', category: 'Ant', location: 'Zone D', confidence: 91.5, timestamp: '2024-11-22 08:00 AM', status: 'Pending' },
        { id: 8, insectName: 'Stag Beetle', category: 'Beetle', location: 'Forest Edge', confidence: 87.2, timestamp: '2024-11-22 07:45 AM', status: 'Verified' }
    ];

    const displayInsects = insects.length > 0 ? insects : dummyInsects;
    const displayRecentUsers = recentUsers.length > 0 ? recentUsers : dummyRecentUsers;
    const displayDetectionData = detectionData.length > 0 ? detectionData : dummyDetectionData;

    let chartData = [];

    if (categoryDistributionData.length > 0) {
        chartData = categoryDistributionData.map(item => ({
            name: item.category || item.name,
            value: item.speciesCount || item.count || item.value || 0,
            percentage: 0
        }));
    } else {
        const categoryDistribution = displayInsects.reduce((acc, insect) => {
            const category = insect.category || 'Unknown';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += 1;
            return acc;
        }, {});

        chartData = Object.entries(categoryDistribution).map(([name, value]) => ({
            name,
            value,
            percentage: 0
        }));
    }

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
        item.percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    });

    const totalSpecies = displayInsects.length;
    const totalDetections = displayInsects.reduce((sum, i) => sum + (i.detections || 0), 0);
    const avgAccuracy = displayInsects.reduce((sum, i) => sum + (i.confidence || 0), 0) / displayInsects.length;
    const activeUsers = displayRecentUsers.filter(u => u.status === 'Active').length;

    const COLORS = [
        { bg: '#3b82f6', light: '#dbeafe' },
        { bg: '#10b981', light: '#d1fae5' },
        { bg: '#f59e0b', light: '#fef3c7' },
        { bg: '#8b5cf6', light: '#ede9fe' },
        { bg: '#ef4444', light: '#fee2e2' },
        { bg: '#06b6d4', light: '#cffafe' },
        { bg: '#ec4899', light: '#fce7f3' }
    ];

    const stats = [
        { title: 'Total Detections', value: totalDetections, change: '+12%', color: '#10b981', icon: <AssessmentIcon /> },
        { title: 'Species Tracked', value: totalSpecies, change: '+3 new', color: '#3b82f6', icon: <BugReportIcon /> },
        { title: 'Active Users', value: activeUsers, change: `${activeUsers}/${displayRecentUsers.length}`, color: '#8b5cf6', icon: <PeopleIcon /> },
        { title: 'Avg Accuracy', value: `${avgAccuracy.toFixed(1)}%`, change: '+2.3%', color: '#f59e0b', icon: <TrendingUpIcon /> }
    ];

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '230px', right: 0, bottom: 0, bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#111827' }}>Dashboard</Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>Overview of your insect detection system performance</Typography>
                </Box>

                {/* Stats Cards */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, width: '100%' }}>
                    {stats.map((stat, idx) => (
                        <Card key={idx} sx={{ flex: 1, minWidth: 0, height: 140, display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</Box>
                                    <Chip label={stat.change} size="small" sx={{ bgcolor: `${stat.color}15`, color: stat.color, fontWeight: 600, fontSize: 12 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: '#111827', fontSize: '2.5rem' }}>{stat.value}</Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>{stat.title}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Donut Chart and Recent User Activity - Side by Side */}
                <Grid container spacing={4}>
                    {/* Donut Chart */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                                    Species Tracked by Category
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {/* Donut Chart */}
                                    <Box sx={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                background: (() => {
                                                    let angle = 0;
                                                    const gradientParts = chartData.map((item, index) => {
                                                        const startAngle = angle;
                                                        angle += (item.value / total) * 360;
                                                        const endAngle = angle;
                                                        return `${COLORS[index % COLORS.length].bg} ${startAngle}deg ${endAngle}deg`;
                                                    });
                                                    return `conic-gradient(${gradientParts.join(', ')})`;
                                                })(),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Box sx={{ width: '60%', height: '60%', borderRadius: '50%', bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography variant="h4" fontWeight={700} color="#111827">{total}</Typography>
                                                <Typography variant="body2" color="text.secondary">Species</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Legend */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                                        {chartData.map((item, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length].bg }} />
                                                    <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">{item.value} ({item.percentage}%)</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent User Activity */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                                    Recent User Activity
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell>User</TableCell>
                                                <TableCell>Last Active</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {displayRecentUsers.map((user) => (
                                                <TableRow key={user.id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                                                                {user.name?.charAt(0)}
                                                            </Avatar>
                                                            <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">{user.lastActive}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.status}
                                                            size="small"
                                                            color={user.status === 'Active' ? 'success' : 'default'}
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};