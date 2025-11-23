// src/components/Analytics/AnalyticsPage.jsx
import { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { ChartCard } from '../Common/ChartCard';
import { COLORS } from '../../theme/theme';

export const AnalyticsPage = () => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

    const [insects, setInsects] = useState([]);
    const [detectionData, setDetectionData] = useState([]);

    // -----------------------------
    // Fetch Analytics from Backend
    // -----------------------------
    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                // Fetch monthly detection stats
                const detRes = await fetch(`${API}/analytics/detections`);
                if (detRes.ok) {
                    const detJson = await detRes.json();
                    setDetectionData(detJson);
                }

                // Fetch insect analytics (list with detections, category, confidence)
                const insRes = await fetch(`${API}/analytics/insects`);
                if (insRes.ok) {
                    const insJson = await insRes.json();
                    setInsects(insJson);
                }

            } catch (err) {
                console.error("Analytics loading failed:", err);
            }
        };

        loadAnalytics();
    }, [API]);

    // -----------------------------
    // Category Pie Chart Data
    // -----------------------------
    const categoryData = [
        { name: 'Butterfly', value: insects.filter(i => i.category === 'Butterfly').length },
        { name: 'Beetle', value: insects.filter(i => i.category === 'Beetle').length },
        { name: 'Dragonfly', value: insects.filter(i => i.category === 'Dragonfly').length },
        { name: 'Ant', value: insects.filter(i => i.category === 'Ant').length },
        { name: 'Bee', value: insects.filter(i => i.category === 'Bee').length },
        {
            name: 'Other',
            value: insects.filter(i =>
                !['Butterfly', 'Beetle', 'Dragonfly', 'Ant', 'Bee'].includes(i.category)
            ).length
        },
    ].filter(item => item.value > 0);

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '230px', right: 0, bottom: 0, bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="700">
                        Analytics & Metrics
                    </Typography>
                </Box>

                <Grid container spacing={4}>

                    {/* Monthly Trend */}
                    <Grid item xs={12} lg={7}>
                        <ChartCard
                            title="Monthly Detection Trend"
                            description="Total detections recorded per month"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={detectionData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="detections"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>

                    {/* Category Pie */}
                    <Grid item xs={12} lg={5}>
                        <ChartCard
                            title="Species Category Distribution"
                            description="Breakdown of detected insect categories"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>

                    {/* Top Species Bar */}
                    <Grid item xs={12}>
                        <ChartCard
                            title="Top Species Performance"
                            description="Detection volume and confidence for top species"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={insects.slice(0, 5)}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                                    <Bar
                                        dataKey="detections"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};
