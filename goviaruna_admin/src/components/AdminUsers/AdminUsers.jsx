// src/components/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import { AdminModal } from './AdminModal';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Avatar, Switch, IconButton, Box, Typography, Chip, Button, Container
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

export const AdminUsers = () => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'; // Vite env variable
    const [adminUsers, setAdminUsers] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load admins from backend
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await fetch(`${API}/admins`);
                const data = await res.json();
                setAdminUsers(data);
            } catch (err) {
                console.error('Error fetching admins:', err);
            }
        };
        fetchAdmins();
    }, [API]);

    // Toggle status
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API}/admins/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                setAdminUsers(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Add / Edit / Delete handlers
    const handleSave = async (adminData) => {
        try {
            if (selectedAdmin) {
                const res = await fetch(`${API}/admins/${selectedAdmin.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(adminData)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setAdminUsers(prev => prev.map(a => a.id === updated.id ? updated : a));
                }
            } else {
                const res = await fetch(`${API}/admins`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(adminData)
                });
                if (res.ok) {
                    const created = await res.json();
                    setAdminUsers(prev => [...prev, created]);
                }
            }
        } catch (err) {
            console.error(err);
        }
        setIsModalOpen(false);
        setSelectedAdmin(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;
        try {
            const res = await fetch(`${API}/admins/${id}`, { method: 'DELETE' });
            if (res.ok) setAdminUsers(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (admin) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedAdmin(null);
        setIsModalOpen(true);
    };

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '230px', right: 0, bottom: 0, bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header + Add Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="700">Admin Users</Typography>
                    <Button onClick={handleAdd} startIcon={<PersonAddIcon />} variant="contained">
                        Add Admin
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adminUsers.map(admin => (
                                <TableRow key={admin.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={admin.imageUrl}>{admin.name?.charAt(0)}</Avatar>
                                            <Typography>{admin.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <Chip label={admin.role} color={admin.role === "Super Admin" ? "primary" : "default"} />
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={admin.isActive} onChange={() => handleToggleStatus(admin.id, admin.isActive)} />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(admin)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDelete(admin.id)} color="error"><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <AdminModal
                    open={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedAdmin(null); }}
                    onSave={handleSave}
                    isEditing={!!selectedAdmin}
                    formData={selectedAdmin}
                />
            </Container>
        </Box>
    );
};
