// src/components/SpeciesDatabase/InsectModal.jsx
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography,
    Box,
    Tabs,
    Tab,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import React from 'react';
import axios from 'axios';

const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const InsectModal = ({ open, onClose, onSave, isEditing, formData, setFormData }) => {
    const [activeTab, setActiveTab] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.scientificName) return;

        setLoading(true);
        try {
            if (isEditing) {
                // Update insect
                const res = await axios.put(`${API_BASE}/insects/${formData.id}`, formData);
                onSave(res.data);
            } else {
                // Create insect
                const res = await axios.post(`${API_BASE}/insects`, formData);
                onSave(res.data);
            }
        } catch (err) {
            console.error("Error saving insect:", err);
            alert("Failed to save insect. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {isEditing ? 'Edit Species' : 'Add New Species'}
            </DialogTitle>
            <DialogContent>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Basic Info" />
                    <Tab label="Effect & Damage" />
                    <Tab label="Control Methods" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <TextField
                        label="Common Name"
                        fullWidth
                        required
                        margin="normal"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        label="Scientific Name"
                        fullWidth
                        required
                        margin="normal"
                        value={formData.scientificName || ''}
                        onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    />
                    <TextField
                        label="Species"
                        fullWidth
                        margin="normal"
                        value={formData.species || ''}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    />
                    <TextField
                        select
                        label="Classification"
                        fullWidth
                        margin="normal"
                        value={formData.classification || 'Harmful'}
                        onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                    >
                        <MenuItem value="Harmful">Harmful</MenuItem>
                        <MenuItem value="Beneficial">Beneficial</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Category"
                        fullWidth
                        margin="normal"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {['Butterfly', 'Beetle', 'Dragonfly', 'Ant', 'Bee', 'Other'].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    {/* Image Upload Section */}
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        Insect Images
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<ImageIcon />}
                        >
                            Upload Images
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={async (e) => {
                                    const files = Array.from(e.target.files);
                                    if (files.length === 0) return;

                                    // Upload images to backend
                                    const uploadedIds = [];
                                    for (const file of files) {
                                        const formDataUpload = new FormData();
                                        formDataUpload.append('file', file);

                                        try {
                                            // Use 'new' for new insects, or the actual ID for editing
                                            const insectId = formData.id || 'new';
                                            const res = await axios.post(
                                                `${API_BASE}/insects/upload_image/${insectId}`,
                                                formDataUpload,
                                                {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                }
                                            );
                                            uploadedIds.push(res.data.file_id);
                                        } catch (err) {
                                            console.error('Error uploading image:', err);
                                            alert(`Failed to upload ${file.name}`);
                                        }
                                    }

                                    // Add uploaded IDs to formData
                                    setFormData(prev => ({
                                        ...prev,
                                        images: [...(prev.images || []), ...uploadedIds]
                                    }));
                                }}
                            />
                        </Button>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Upload images (JPG, PNG, etc.)
                        </Typography>
                    </Box>

                    {/* Display Existing Images */}
                    {formData.images && formData.images.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                Uploaded Images ({formData.images.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {formData.images.map((imageId, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            position: 'relative',
                                            width: 120,
                                            height: 120,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border: '2px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <img
                                            src={`${API_BASE}/insects/image/${imageId}`}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                width: 24,
                                                height: 24,
                                                '&:hover': {
                                                    bgcolor: 'error.dark'
                                                }
                                            }}
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: prev.images.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <TextField
                        label="Damage Description"
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        value={formData.damage || ''}
                        onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Damage Images (One URL per line)</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={Array.isArray(formData.damageImages) ? formData.damageImages.join('\n') : ''}
                        onChange={(e) => {
                            const urls = e.target.value.split('\n').filter(url => url.trim());
                            setFormData({ ...formData, damageImages: urls });
                        }}
                        placeholder="Enter damage image URLs, one per line"
                    />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <Typography variant="subtitle1" gutterBottom>Chemical Control</Typography>
                    <TextField
                        label="Insecticide Name"
                        fullWidth
                        margin="normal"
                        value={formData.insecticide?.name || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            insecticide: { ...formData.insecticide, name: e.target.value }
                        })}
                    />
                    <TextField
                        label="Concentration"
                        fullWidth
                        margin="normal"
                        value={formData.insecticide?.concentration || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            insecticide: { ...formData.insecticide, concentration: e.target.value }
                        })}
                    />
                    <TextField
                        label="Amount per Hectare"
                        fullWidth
                        margin="normal"
                        value={formData.insecticide?.amountPerHectare || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            insecticide: { ...formData.insecticide, amountPerHectare: e.target.value }
                        })}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 3 }}>Other Control Methods</Typography>
                    <TextField
                        label="Resistant Rice Varieties (One per line)"
                        fullWidth
                        multiline
                        rows={2}
                        margin="normal"
                        value={Array.isArray(formData.resistantVarieties) ? formData.resistantVarieties.join('\n') : ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            resistantVarieties: e.target.value.split('\n').filter(v => v.trim())
                        })}
                    />
                    <TextField
                        label="Eco-friendly Solutions (One per line)"
                        fullWidth
                        multiline
                        rows={2}
                        margin="normal"
                        value={Array.isArray(formData.ecoFriendlySolutions) ? formData.ecoFriendlySolutions.join('\n') : ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            ecoFriendlySolutions: e.target.value.split('\n').filter(v => v.trim())
                        })}
                    />
                </TabPanel>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                    startIcon={isEditing ? <EditIcon /> : <AddIcon />}
                    disabled={loading}
                >
                    {isEditing ? 'Save Changes' : 'Add Species'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
