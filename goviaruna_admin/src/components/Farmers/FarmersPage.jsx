import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    CircularProgress,
    Container
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const FarmersPage = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const res = await fetch(`${API}/app/auth/users`);
            if (res.ok) {
                const data = await res.json();
                setFarmers(data);
            }
        } catch (error) {
            console.error('Error fetching farmers:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, paddingRight: '20px', bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="700" gutterBottom>
                            Farmers
                        </Typography>

                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Farmer</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Contact Info</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Land Size</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {farmers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No farmers found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    farmers.map((farmer) => (
                                        <TableRow key={farmer.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={farmer.imageUrl ? `${API}/app/auth/image/${farmer.imageUrl}` : null}
                                                        sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                                                    >
                                                        {farmer.name?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {farmer.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{farmer.email}</TableCell>
                                            <TableCell>{farmer.district || '-'}</TableCell>
                                            <TableCell>{farmer.landSize ? `${farmer.landSize} Acres` : '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Active"
                                                    color="success"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
};


