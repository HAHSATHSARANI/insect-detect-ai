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
    Paper,
    List,
    ListItem,
    Card,
    CardContent,
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
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const InsectDetailsModal = ({ open, onClose, insect }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentDamageImageIndex, setCurrentDamageImageIndex] = useState(0);

    // Reset image indexes when modal opens
    useEffect(() => {
        if (open) {
            setCurrentImageIndex(0);
            setCurrentDamageImageIndex(0);
        }
    }, [open]);

    if (!insect) return null;

    const images = Array.isArray(insect.images) && insect.images.length > 0
        ? insect.images
        : insect.image ? [insect.image] : [];

    const damageImages = Array.isArray(insect.damageImages) ? insect.damageImages : [];

    // Helper function to get image URL
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

    const handleNextDamageImage = (e) => {
        e.stopPropagation();
        setCurrentDamageImageIndex((prev) => (prev + 1) % damageImages.length);
    };

    const handlePrevDamageImage = (e) => {
        e.stopPropagation();
        setCurrentDamageImageIndex((prev) => (prev - 1 + damageImages.length) % damageImages.length);
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
                        {insect.scientificName || "N/A"}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Chip
                            label={insect.classification || "Harmful"}
                            color={insect.classification === "Beneficial" ? "success" : "error"}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={insect.category || "Unknown"}
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
                                    height: 280,
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

                {/* Basic Information */}
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                            <ScienceIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
                            <Typography variant="h6" fontWeight="700">Basic Information</Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                    Description
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                    {insect.description || "No description available."}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                                        Classification Details
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={600}>Species:</Typography>
                                            <Typography variant="body2">{insect.species || 'N/A'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={600}>Category:</Typography>
                                            <Typography variant="body2">{insect.category || 'N/A'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={600}>Detections:</Typography>
                                            <Typography variant="body2">{insect.detections?.toLocaleString() || 0}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={600}>Confidence:</Typography>
                                            <Typography variant="body2">{insect.confidence?.toFixed(1) || 0}%</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Damage Section */}
                {insect.damage && (
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, borderLeft: '4px solid #ef4444' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                <WarningIcon sx={{ fontSize: 24, color: '#ef4444', mr: 1.5 }} />
                                <Typography variant="h6" fontWeight="700">Effect & Damage</Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={damageImages.length > 0 ? 6 : 12}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                        {insect.damage}
                                    </Typography>
                                </Grid>

                                {damageImages.length > 0 && (
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                            <img
                                                src={getImageUrl(damageImages[currentDamageImageIndex])}
                                                alt={`${insect.name} damage ${currentDamageImageIndex + 1}`}
                                                style={{ width: '100%', height: 250, objectFit: 'cover' }}
                                            />
                                            {damageImages.length > 1 && (
                                                <>
                                                    <IconButton
                                                        onClick={handlePrevDamageImage}
                                                        sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                                                        size="small"
                                                    >
                                                        <ArrowBackIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={handleNextDamageImage}
                                                        sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                                                        size="small"
                                                    >
                                                        <ArrowForwardIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Control Methods */}
                <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: '4px solid #10b981' }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                            <ControlIcon sx={{ fontSize: 24, color: '#10b981', mr: 1.5 }} />
                            <Typography variant="h6" fontWeight="700">Control Methods</Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {insect.resistantVarieties?.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <CheckCircleIcon sx={{ color: '#16a34a', mr: 1, fontSize: 20 }} />
                                            <Typography variant="subtitle1" fontWeight="600">Resistant Rice Varieties</Typography>
                                        </Box>
                                        <List dense disablePadding>
                                            {insect.resistantVarieties.map((variety, index) => (
                                                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                                    <Typography variant="body2">• {variety}</Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Grid>
                            )}

                            {insect.ecoFriendlySolutions?.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <EcoIcon sx={{ color: '#0284c7', mr: 1, fontSize: 20 }} />
                                            <Typography variant="subtitle1" fontWeight="600">Eco-friendly Solutions</Typography>
                                        </Box>
                                        <List dense disablePadding>
                                            {insect.ecoFriendlySolutions.map((solution, index) => (
                                                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                                    <Typography variant="body2">• {solution}</Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Grid>
                            )}

                            {insect.insecticide && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#fef3c7', border: '1px solid #fde047' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <ChemicalIcon sx={{ color: '#ca8a04', mr: 1, fontSize: 20 }} />
                                            <Typography variant="subtitle1" fontWeight="600">Chemical Control</Typography>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>Insecticide Name</Typography>
                                                <Typography variant="body1" fontWeight={500}>{insect.insecticide.name || "Not specified"}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>Concentration</Typography>
                                                <Typography variant="body1" fontWeight={500}>{insect.insecticide.concentration || "Not specified"}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>Amount per Hectare</Typography>
                                                <Typography variant="body1" fontWeight={500}>{insect.insecticide.amountPerHectare || "Not specified"}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};
