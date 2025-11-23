// src/components/Admin/AdminModal.jsx
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    FormControlLabel,
    Switch,
    Box,
    Avatar
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

export const AdminModal = ({
    open,
    onClose,
    onSave,
    isEditing,
    formData
}) => {

    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        role: 'Admin',
        isActive: true,
        imageUrl: '',
        password: '',
        confirmPassword: ''
    });

    // Load selected admin into modal
    useEffect(() => {
        if (isEditing && formData) {
            setAdminData({
                name: formData.name || '',
                email: formData.email || '',
                role: formData.role || 'Admin',
                isActive: formData.isActive ?? true,
                imageUrl: formData.imageUrl || '',
                password: '',
                confirmPassword: ''
            });
        } else {
            setAdminData({
                name: '',
                email: '',
                role: 'Admin',
                isActive: true,
                imageUrl: '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [formData, isEditing, open]);

    const handleChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const handleToggle = () => {
        setAdminData({ ...adminData, isActive: !adminData.isActive });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdminData({ ...adminData, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        // Validate password match for new admins
        if (!isEditing && adminData.password !== adminData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Validate password is provided for new admins
        if (!isEditing && !adminData.password) {
            alert('Password is required!');
            return;
        }

        // Don't send confirmPassword to backend
        const { confirmPassword, ...dataToSend } = adminData;

        // Only send password if it's a new admin or if password was changed
        if (isEditing && !adminData.password) {
            delete dataToSend.password;
        }

        onSave(dataToSend);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    '& .MuiDialogContent-root': {
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        },
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }
                }
            }}
        >
            <DialogTitle>
                {isEditing ? 'Edit Admin User' : 'Add New Admin'}
            </DialogTitle>

            <DialogContent dividers>
                {/* Profile Picture Upload */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 1 }}>
                    <Avatar
                        src={adminData.imageUrl}
                        sx={{ width: 100, height: 100, mb: 2 }}
                    >
                        {adminData.name?.charAt(0)}
                    </Avatar>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCameraIcon />}
                        size="small"
                    >
                        Upload Photo
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </Button>
                </Box>

                <TextField
                    label="Full Name"
                    name="name"
                    value={adminData.name}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    required
                />

                <TextField
                    label="Email"
                    name="email"
                    value={adminData.email}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    type="email"
                    required
                />

                <TextField
                    label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                    name="password"
                    value={adminData.password}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    type="password"
                    required={!isEditing}
                />

                <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={adminData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    type="password"
                    required={!isEditing}
                    error={adminData.password !== adminData.confirmPassword && adminData.confirmPassword !== ''}
                    helperText={
                        adminData.password !== adminData.confirmPassword && adminData.confirmPassword !== ''
                            ? 'Passwords do not match'
                            : ''
                    }
                />

                <TextField
                    select
                    label="Role"
                    name="role"
                    value={adminData.role}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Super Admin">Super Admin</MenuItem>
                </TextField>

                <FormControlLabel
                    control={
                        <Switch
                            checked={adminData.isActive}
                            onChange={handleToggle}
                        />
                    }
                    label="Active"
                    sx={{ mt: 2 }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
