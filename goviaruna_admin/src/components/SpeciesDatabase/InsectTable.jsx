// src/components/SpeciesDatabase/InsectCards.jsx
import { Box, Card, CardContent, CardMedia, Typography, Chip, IconButton, Grid } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useState } from 'react';
import { InsectDetailsModal } from './InsectDetailsModal';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const InsectTable = ({ insects, onEdit, onDelete }) => {
    const [selectedInsect, setSelectedInsect] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [imageIndexes, setImageIndexes] = useState({});

    const handleOpenDetails = (insect) => {
        setSelectedInsect(insect);
        setShowDetailsModal(true);
    };

    const handleImageNavigate = (insectId, direction) => {
        setImageIndexes(prev => {
            const currentIndex = prev[insectId] || 0;
            const insect = insects.find(i => i.id === insectId);
            const totalImages = insect.images?.length || 1;
            const newIndex = direction === 'next'
                ? (currentIndex + 1) % totalImages
                : (currentIndex - 1 + totalImages) % totalImages;
            return { ...prev, [insectId]: newIndex };
        });
    };

    const getImageUrl = (insect, index = 0) => {
        const fileId = insect.images?.[index] || insect.image;
        return fileId ? `${API_BASE}/insects/image/${fileId}` : '/images/default-insect.png';
    };

    return (
        <>
            <Grid container spacing={3}>
                {insects.map((insect) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={insect.id}>
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                            onClick={() => handleOpenDetails(insect)}
                        >
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    image={getImageUrl(insect, imageIndexes[insect.id] || 0)}
                                    alt={insect.name}
                                    sx={{ height: 200, objectFit: 'cover' }}
                                />
                                {insect.images?.length > 1 && (
                                    <>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); handleImageNavigate(insect.id, 'prev'); }}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                left: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                                            }}
                                        >
                                            <ArrowBackIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); handleImageNavigate(insect.id, 'next'); }}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                                            }}
                                        >
                                            <ArrowForwardIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                    {insect.name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 1 }}>
                                    {insect.scientificName}
                                </Typography>
                                <Chip
                                    label={insect.category}
                                    size="small"
                                    sx={{
                                        bgcolor: insect.classification === 'Beneficial' ? '#10b981' : '#f59e0b',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                                <Box
                                    sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Confidence: {insect.confidence?.toFixed(1)}%
                                    </Typography>
                                    <Box>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); onEdit(insect); }}
                                            size="small"
                                            color="primary"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); onDelete(insect.id); }}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Details Modal */}
            <InsectDetailsModal
                open={showDetailsModal}
                onClose={() => { setShowDetailsModal(false); setSelectedInsect(null); }}
                insect={selectedInsect}
            />
        </>
    );
};
