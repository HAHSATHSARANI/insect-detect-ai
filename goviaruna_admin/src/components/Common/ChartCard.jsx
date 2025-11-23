// src/components/Common/ChartCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ChartCard = ({
    title,
    subtitle,
    icon: Icon,
    data = [],
    dataKey = 'value',
    stroke = '#3f51b5',
    height = 200
}) => {
    return (
        <Card sx={{ borderRadius: 2, boxShadow: 3, p: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {Icon && <Icon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />}
                    <Box>
                        <Typography variant="h6" fontWeight={600}>{title}</Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
