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
    IconButton,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Image as ImageIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

    const handleAddChemicalRow = () => {
        setFormData(prev => ({
            ...prev,
            chemicalControlTable: [
                ...(prev.chemicalControlTable || []),
                { name: '', concentration: '', amount: '' }
            ]
        }));
    };

    const handleRemoveChemicalRow = (index) => {
        setFormData(prev => ({
            ...prev,
            chemicalControlTable: prev.chemicalControlTable.filter((_, i) => i !== index)
        }));
    };

    const handleChemicalChange = (index, field, value) => {
        const newTable = [...(formData.chemicalControlTable || [])];
        newTable[index] = { ...newTable[index], [field]: value };
        setFormData({ ...formData, chemicalControlTable: newTable });
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
            <DialogContent sx={{
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                '-ms-overflow-style': 'none',
                'scrollbarWidth': 'none'
            }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: 'none',
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#10b981',
                        },
                        '& .MuiTab-root': {
                            outline: 'none',
                        }
                    }}
                >
                    <Tab label="Basic Info" sx={{ outline: 'none' }} />
                    <Tab label="Life Cycle & Damage" sx={{ outline: 'none' }} />
                    <Tab label="Control Methods" sx={{ outline: 'none' }} />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <Box>
                        <TextField
                            label="Common Name"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Scientific Name (Short)"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.scientificName || ''}
                            onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                        />
                        <TextField
                            label="Full Scientific Name"
                            fullWidth
                            margin="normal"
                            value={formData.scientificNameFull || ''}
                            onChange={(e) => setFormData({ ...formData, scientificNameFull: e.target.value })}
                        />
                        <TextField
                            label="Family"
                            fullWidth
                            margin="normal"
                            value={formData.family || ''}
                            onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                        />
                        <TextField
                            select
                            label="Category"
                            fullWidth
                            margin="normal"
                            value={formData.category || 'Harmful'}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <MenuItem value="Harmful">Harmful</MenuItem>
                            <MenuItem value="Beneficial">Beneficial</MenuItem>
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
                    </Box>

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
                    </Box>

                    {/* Display Existing Images */}
                    {formData.images && formData.images.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Typography variant="h6" gutterBottom>Life Cycle</Typography>
                    <TextField
                        label="Life Cycle Title"
                        fullWidth
                        margin="normal"
                        value={formData.lifeCycleTitle || 'ජීවන චක්‍රය'}
                        onChange={(e) => setFormData({ ...formData, lifeCycleTitle: e.target.value })}
                    />
                    <TextField
                        label="Life Cycle Content"
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        value={formData.lifeCycleContent || ''}
                        onChange={(e) => setFormData({ ...formData, lifeCycleContent: e.target.value })}
                    />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Damage & Symptoms</Typography>
                    <TextField
                        label="Damage Symptoms Title"
                        fullWidth
                        margin="normal"
                        value={formData.damageSymptomsTitle || 'හානි ලක්ෂණ'}
                        onChange={(e) => setFormData({ ...formData, damageSymptomsTitle: e.target.value })}
                    />
                    <TextField
                        label="Damage Symptoms Content"
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        value={formData.damageSymptomsContent || ''}
                        onChange={(e) => setFormData({ ...formData, damageSymptomsContent: e.target.value })}
                    />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <Typography variant="h6" gutterBottom>Control Methods</Typography>
                    <TextField
                        label="Control Methods Title"
                        fullWidth
                        margin="normal"
                        value={formData.controlMethodsTitle || 'පාලන ක්‍රම'}
                        onChange={(e) => setFormData({ ...formData, controlMethodsTitle: e.target.value })}
                    />
                    <TextField
                        label="General Control Content"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={formData.controlMethodsContent || ''}
                        onChange={(e) => setFormData({ ...formData, controlMethodsContent: e.target.value })}
                    />

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Resistant Rice Varieties"
                                fullWidth
                                multiline
                                rows={2}
                                margin="normal"
                                value={formData.resistantVarieties || ''}
                                onChange={(e) => setFormData({ ...formData, resistantVarieties: e.target.value })}
                                helperText="Enter resistant varieties details"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Pesticide Instructions"
                                fullWidth
                                multiline
                                rows={2}
                                margin="normal"
                                value={formData.pesticideInstructions || ''}
                                onChange={(e) => setFormData({ ...formData, pesticideInstructions: e.target.value })}
                                helperText="General instructions for pesticide application"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Eco-Friendly Solutions"
                                fullWidth
                                multiline
                                rows={2}
                                margin="normal"
                                value={formData.ecoFriendlySolutions || ''}
                                onChange={(e) => setFormData({ ...formData, ecoFriendlySolutions: e.target.value })}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Chemical Control Table</Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell>Chemical Name</TableCell>
                                    <TableCell>Concentration</TableCell>
                                    <TableCell>Amount per Hectare</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(formData.chemicalControlTable || []).map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                variant="standard"
                                                fullWidth
                                                value={row.name}
                                                onChange={(e) => handleChemicalChange(index, 'name', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                variant="standard"
                                                fullWidth
                                                value={row.concentration}
                                                onChange={(e) => handleChemicalChange(index, 'concentration', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                variant="standard"
                                                fullWidth
                                                value={row.amount}
                                                onChange={(e) => handleChemicalChange(index, 'amount', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="error" onClick={() => handleRemoveChemicalRow(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Button startIcon={<AddIcon />} onClick={handleAddChemicalRow}>
                                            Add Chemical
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TextField
                        label="Additional Notes"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        sx={{ mt: 3 }}
                        value={formData.additionalNotes || ''}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
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
