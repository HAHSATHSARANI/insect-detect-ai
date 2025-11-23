// src/components/SpeciesDatabase/InsectDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Box,
    Grid,
    Chip,
    Card,
    CardContent,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import {
    Close as CloseIcon,
    Science as ScienceIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Grass as EcoIcon,
    Biotech as ChemicalIcon,
    ControlPoint as ControlIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    Spa as SproutIcon,
    BugReport as BugIcon
} from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const InsectDetailsModal = ({ open, onClose, insect }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (open) {
            setCurrentImageIndex(0);
        }
    }, [open]);

    if (!insect) return null;

    const images = Array.isArray(insect.images) && insect.images.length > 0
        ? insect.images
        : insect.image ? [insect.image] : [];

    const getImageUrl = (fileId) => {
        return fileId ? `${API_BASE}/insects/image/${fileId}` : '/images/default-insect.png';
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: '#fafafa',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 2,
                px: 3,
                bgcolor: 'white'
            }}>
                <Box>
                    <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                        {insect.name || "Unnamed Insect"}
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', fontWeight: 400 }}>
                        {insect.scientificName} {insect.scientificNameFull ? `(${insect.scientificNameFull})` : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Chip
                            label={insect.category || "Harmful"}
                            color={insect.category === "Beneficial" ? "success" : "error"}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                         {insect.family && (
                             <Chip
                                label={`Family: ${insect.family}`}
                                variant="outlined"
                                size="small"
                            />
                        )}
                        <Chip
                            label={`${insect.confidence || 0}% Confidence`}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="medium" sx={{ mt: -0.5 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
                {/* Hero Image Section */}
                {images.length > 0 && (
                    <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                        <Box sx={{ position: 'relative', bgcolor: '#000' }}>
                            <img
                                src={getImageUrl(images[currentImageIndex])}
                                alt={`${insect.name} ${currentImageIndex + 1}`}
                                style={{
                                    width: '100%',
                                    height: 300,
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                            {images.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 16,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            '&:hover': { bgcolor: 'white' }
                                        }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 16,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            '&:hover': { bgcolor: 'white' }
                                        }}
                                    >
                                        <ArrowForwardIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Card>
                )}

                <Grid container spacing={3}>
                    {/* Description & Life Cycle */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <InfoIcon sx={{ color: 'primary.main', mr: 1 }} />
                                    <Typography variant="h6" fontWeight="700">Description</Typography>
                                </Box>
                                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                                    {insect.description || "No description available."}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <BugIcon sx={{ color: 'primary.main', mr: 1 }} />
                                    <Typography variant="h6" fontWeight="700">{insect.lifeCycleTitle || "Life Cycle"}</Typography>
                                </Box>
                                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                    {insect.lifeCycleContent || "No details available."}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Damage & Symptoms */}
                    <Grid item xs={12} md={6}>
                         <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1, borderTop: '4px solid #ef4444' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                                    <Typography variant="h6" fontWeight="700">{insect.damageSymptomsTitle || "Damage"}</Typography>
                                </Box>
                                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                    {insect.damageSymptomsContent || "No details available."}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Control Methods - Full Width */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 2, boxShadow: 1, borderTop: '4px solid #10b981' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <ControlIcon sx={{ color: 'success.main', mr: 1 }} />
                                    <Typography variant="h6" fontWeight="700">{insect.controlMethodsTitle || "Control Methods"}</Typography>
                                </Box>
                                
                                <Typography variant="body1" paragraph>
                                    {insect.controlMethodsContent}
                                </Typography>

                                <Grid container spacing={3} sx={{ mt: 1 }}>
                                    {/* Resistant Varieties */}
                                    {insect.resistantVarieties && (
                                        <Grid item xs={12} md={4}>
                                            <Paper sx={{ p: 2, bgcolor: '#f0fdf4', height: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <SproutIcon sx={{ color: 'success.main', mr: 1 }} />
                                                    <Typography variant="subtitle2" fontWeight="bold">Resistant Varieties</Typography>
                                                </Box>
                                                <Typography variant="body2">{insect.resistantVarieties}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                    
                                    {/* Eco Friendly */}
                                    {insect.ecoFriendlySolutions && (
                                        <Grid item xs={12} md={4}>
                                            <Paper sx={{ p: 2, bgcolor: '#f0f9ff', height: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <EcoIcon sx={{ color: 'info.main', mr: 1 }} />
                                                    <Typography variant="subtitle2" fontWeight="bold">Eco-Friendly Solutions</Typography>
                                                </Box>
                                                <Typography variant="body2">{insect.ecoFriendlySolutions}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}

                                    {/* Pesticide Instructions */}
                                     {insect.pesticideInstructions && (
                                        <Grid item xs={12} md={4}>
                                            <Paper sx={{ p: 2, bgcolor: '#fff7ed', height: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <ChemicalIcon sx={{ color: 'warning.main', mr: 1 }} />
                                                    <Typography variant="subtitle2" fontWeight="bold">Pesticide Instructions</Typography>
                                                </Box>
                                                <Typography variant="body2">{insect.pesticideInstructions}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>

                                {/* Chemical Control Table */}
                                {insect.chemicalControlTable && insect.chemicalControlTable.length > 0 && (
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Chemical Control Table</Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Chemical Name</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Concentration</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Amount / Hectare</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {insect.chemicalControlTable.map((row, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{row.name}</TableCell>
                                                            <TableCell>{row.concentration}</TableCell>
                                                            <TableCell>{row.amount}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Additional Notes */}
                                {insect.additionalNotes && (
                                    <Paper sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderLeft: '4px solid #64748b' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Additional Notes</Typography>
                                        <Typography variant="body2">{insect.additionalNotes}</Typography>
                                    </Paper>
                                )}

                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};
