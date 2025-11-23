import { useState } from 'react';
import { Box, Button, Container, Typography, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { InsectTable } from './InsectTable';
import { InsectModal } from './InsectModal';

export const SpeciesDatabase = ({
    insects,
    showInsectModal,
    setShowInsectModal,
    editingInsect,
    setEditingInsect,
    insectFormData,
    setInsectFormData,
    handleSaveInsect,
    handleEditInsect,
    handleDeleteInsect
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter insects based on search term (case-insensitive)
    const filteredInsects = insects.filter((insect) =>
        [insect.name, insect.scientificName, insect.category]
            .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '230px', right: 0, bottom: 0, bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header + Add Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="700">Species Database</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setEditingInsect(null);
                            setInsectFormData({
                                name: '',
                                scientificName: '',
                                species: '',
                                classification: 'Beneficial',
                                description: '',
                                images: [],   // <- initialized for GridFS IDs
                                lifeCycle: '',
                                characteristics: '',
                                spread: '',
                                effectImages: [],
                                damage: '',
                                controlMethods: {
                                    targetedInsects: [],
                                    controlInfo: '',
                                    resistantVarieties: '',
                                    chemicalMethod: '',
                                    ecoFriendlySolutions: '',
                                    insecticides: [{ name: '', concentration: '', amountPerHectare: '' }],
                                    other: ''
                                },
                                category: 'Butterfly',
                                confidence: 95
                            });
                            setShowInsectModal(true);
                        }}
                        sx={{ borderRadius: 2, fontWeight: 600, color: 'white' }}
                    >
                        Add New Species
                    </Button>
                </Box>

                {/* Search Bar */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-start' }}>
                    <TextField
                        placeholder="Search species by name, scientific name, or category..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 400 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Box>

                {/* Insect Table */}
                <InsectTable
                    insects={filteredInsects}
                    onEdit={handleEditInsect}
                    onDelete={handleDeleteInsect}
                />

                {/* Add/Edit Modal */}
                <InsectModal
                    open={showInsectModal}
                    onClose={() => setShowInsectModal(false)}
                    onSave={handleSaveInsect}
                    isEditing={!!editingInsect}
                    formData={insectFormData}
                    setFormData={setInsectFormData}
                />
            </Container>
        </Box>
    );
};
