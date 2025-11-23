// src/components/Community/TestChatPage.jsx
import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const TestChatPage = () => {
    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const [addedMessages, setAddedMessages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddMessage = async () => {
        if (!userName.trim() || !message.trim()) {
            setError('Please enter both user name and message');
            return;
        }

        try {
            const res = await fetch(`${API}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userName.trim(),
                    content: message.trim(),
                    sender: 'user'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setAddedMessages(prev => [...prev, { userName, message, timestamp: new Date() }]);
                setSuccess(`Message added from ${userName}!`);
                setMessage(''); // Clear message but keep userName for quick testing
                setError('');

                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await res.json();
                setError(`Failed to add message: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error adding message:', err);
            setError('Server error. Make sure backend is running.');
        }
    };

    const quickAddSampleMessages = async () => {
        const sampleMessages = [
            { username: 'John Farmer', content: 'I found some unusual insects on my crops. Can you help identify them?', sender: 'user' },
            { username: 'Sarah Green', content: 'The detection system is working great! Thank you!', sender: 'user' },
            { username: 'Mike Johnson', content: 'How do I upload images of the insects I found?', sender: 'user' },
            { username: 'Emma Wilson', content: 'Is there a way to get notifications when new insects are detected?', sender: 'user' },
            { username: 'David Brown', content: 'The app helped me identify a pest problem early. Excellent work!', sender: 'user' }
        ];

        for (const msg of sampleMessages) {
            try {
                await fetch(`${API}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(msg)
                });
                setAddedMessages(prev => [...prev, { userName: msg.username, message: msg.content, timestamp: new Date() }]);
            } catch (err) {
                console.error('Error adding sample message:', err);
            }
        }
        setSuccess('5 sample messages added!');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <Box sx={{ position: 'fixed', top: 0, left: '230px', right: 0, bottom: 0, bgcolor: '#f5f7fa', overflow: 'auto' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                    Test Chat Messages
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Add test messages to populate the Community page chat list
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Add Single Message</Typography>

                    <TextField
                        label="User Name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="e.g., John Farmer"
                    />

                    <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        placeholder="Enter the message content..."
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddMessage}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        Add Message
                    </Button>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Quick Test Data</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add 5 sample messages with different users
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={quickAddSampleMessages}
                        fullWidth
                    >
                        Add 5 Sample Messages
                    </Button>
                </Paper>

                {addedMessages.length > 0 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Recently Added ({addedMessages.length})
                        </Typography>
                        <List>
                            {addedMessages.map((msg, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={msg.userName}
                                            secondary={msg.message}
                                        />
                                    </ListItem>
                                    {index < addedMessages.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}

                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.dark">
                        <strong>Note:</strong> After adding messages, go to the Community page to see the chat list.
                        Click on a user to view and reply to their messages.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};
