// src/components/Community/CommunityPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Avatar,
    Typography,
    TextField,
    IconButton,
    Paper,
    Badge,
    Divider,
    Checkbox,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    Delete as DeleteIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    CheckBox as CheckBoxIcon,
    Forum as ForumIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export default function CommunityPage() {
    // List of conversations with their details
    const [conversations, setConversations] = useState([]);
    // Messages for the selected conversation
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Selected conversation to chat with
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null); // User info for the conversation
    const scrollRef = useRef(null);

    // Message selection and deletion
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Fetch all conversations from all users
    const loadConversations = async () => {
        try {
            // Get all user IDs who have conversations
            const usersRes = await fetch(`${API}/chat/users`);
            if (!usersRes.ok) return;

            const userIds = await usersRes.json();

            // Fetch conversations for each user
            const allConversations = [];
            for (const userId of userIds) {
                try {
                    const conversationsRes = await fetch(`${API}/chat/conversations/${userId}`);
                    if (conversationsRes.ok) {
                        const userConversations = await conversationsRes.json();

                        // Fetch user details for each conversation
                        for (const conv of userConversations) {
                            try {
                                const userRes = await fetch(`${API}/app/auth/user/${userId}`);
                                if (userRes.ok) {
                                    const userData = await userRes.json();
                                    conv.user = userData;
                                } else {
                                    // Fallback if user endpoint fails
                                    conv.user = { name: `User ${userId.slice(-4)}`, email: '', id: userId };
                                }
                            } catch (err) {
                                console.log('Could not fetch user data for', userId);
                                conv.user = { name: `User ${userId.slice(-4)}`, email: '', id: userId };
                            }
                        }

                        allConversations.push(...userConversations);
                    }
                } catch (err) {
                    console.error(`Failed to load conversations for user ${userId}`, err);
                }
            }

            // Sort by last message time (newest first)
            allConversations.sort((a, b) => {
                const timeA = new Date(a.lastMessageTime || a.updatedAt || 0);
                const timeB = new Date(b.lastMessageTime || b.updatedAt || 0);
                return timeB - timeA;
            });

            setConversations(allConversations);
        } catch (err) {
            console.error('Failed to load conversations', err);
        }
    };

    // Fetch chat history for selected conversation
    const loadChatHistory = async (conversationId) => {
        try {
            const res = await fetch(`${API}/chat/conversations/${conversationId}/messages`);
            if (res.ok) {
                const messages = await res.json();
                setChatMessages(messages);
            }
        } catch (err) {
            console.error('Failed to load chat history', err);
        }
    };

    // Mark conversation as read when admin opens it
    const markConversationAsRead = async (conversationId) => {
        try {
            await fetch(`${API}/chat/conversations/${conversationId}/read`, {
                method: 'PUT'
            });
            // Update local state
            setConversations(prev => prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            ));
        } catch (err) {
            console.error('Failed to mark conversation as read', err);
        }
    };

    // Initial load + polling every 5 seconds
    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load chat history when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            loadChatHistory(selectedConversation.id);
            markConversationAsRead(selectedConversation.id);
            const interval = setInterval(() => loadChatHistory(selectedConversation.id), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation]);

    // Auto‑scroll to latest message when chat view updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Send a message to the selected conversation
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const res = await fetch(`${API}/chat/conversations/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    userId: selectedConversation.userId,
                    content: newMessage,
                    sender: 'admin'
                }),
            });
            if (res.ok) {
                setNewMessage('');
                loadChatHistory(selectedConversation.id);
                loadConversations(); // Refresh conversation list
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    // Toggle message selection
    const handleToggleMessage = (messageId) => {
        setSelectedMessages(prev => {
            if (prev.includes(messageId)) {
                return prev.filter(id => id !== messageId);
            } else {
                return [...prev, messageId];
            }
        });
    };

    // Delete selected messages
    const handleDeleteMessages = async () => {
        try {
            const res = await fetch(`${API}/chat/delete-multiple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedMessages)
            });

            if (res.ok) {
                setSelectedMessages([]);
                setSelectionMode(false);
                setDeleteDialogOpen(false);
                loadChatHistory(selectedConversation.id);
                loadConversations();
            }
        } catch (err) {
            console.error('Failed to delete messages', err);
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return format(date, 'HH:mm');
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return format(date, 'EEEE');
        } else {
            return format(date, 'dd/MM/yyyy');
        }
    };

    // Delete entire conversation
    const [deleteConversationDialogOpen, setDeleteConversationDialogOpen] = useState(false);

    const handleDeleteConversation = async () => {
        if (!selectedConversation) return;

        try {
            const res = await fetch(`${API}/chat/conversations/${selectedConversation.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDeleteConversationDialogOpen(false);
                setSelectedConversation(null);
                setSelectedUser(null);
                loadConversations();
            }
        } catch (err) {
            console.error('Failed to delete conversation', err);
        }
    };

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: '280px',
            right: 0,
            bottom: 0,
            paddingRight: '20px',
            bgcolor: '#f5f7fa',
            overflow: 'hidden',
        }}>
            <Container maxWidth="xl" sx={{ height: '100%', py: 4, display: 'flex', flexDirection: 'column' }}>
                {/* Page Header - Only show when no conversation is selected */}
                {!selectedConversation && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="700">
                            Community Chat
                        </Typography>
                    </Box>
                )}

                <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'row', gap: 0 }}>
                    {/* Conversations List - Always visible */}
                    <Box sx={{
                        width: selectedConversation ? '350px' : '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'width 0.3s ease',
                        bgcolor: 'white',
                        borderRight: selectedConversation ? '1px solid #e0e0e0' : 'none',
                        boxShadow: selectedConversation ? '2px 0 4px rgba(0,0,0,0.05)' : 'none'
                    }}>
                        <List sx={{
                            p: 0,
                            overflow: 'auto',
                            flex: 1,
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}>
                            {conversations.length === 0 ? (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <ForumIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No conversations yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Farmers will start conversations from the mobile app.
                                    </Typography>
                                </Box>
                            ) : (
                                conversations.map((conversation, index) => (
                                    <React.Fragment key={conversation.id}>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    setSelectedConversation(conversation);
                                                    setSelectedUser(conversation.user);
                                                }}
                                                selected={selectedConversation?.id === conversation.id}
                                                sx={{
                                                    py: 2,
                                                    px: 3,
                                                    bgcolor: selectedConversation?.id === conversation.id ? '#f0f0f0' : 'transparent'
                                                }}
                                            >
                                                <Badge
                                                    badgeContent={conversation.unreadCount}
                                                    color="primary"
                                                    sx={{ mr: 2 }}
                                                >
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                                                        {(conversation.user?.name || 'U').charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                                <ListItemText
                                                    primary={
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight={conversation.unreadCount > 0 ? 700 : 600}>
                                                                {conversation.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <span style={{ fontWeight: 500, color: '#008069' }}>{conversation.user?.name || 'Unknown User'}</span>
                                                                •
                                                                <span style={{ fontSize: '0.75rem' }}>{formatTimestamp(conversation.lastMessageTime)}</span>
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: '250px',
                                                                mt: 0.5,
                                                                fontStyle: 'italic'
                                                            }}
                                                        >
                                                            {conversation.lastMessage || 'No messages yet'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {index < conversations.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Box>

                    {/* Chat View - Only visible when conversation is selected */}
                    {selectedConversation && (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Chat Header */}
                            <Box sx={{
                                p: 2,
                                bgcolor: '#016351ff',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: 2
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ mr: 2, bgcolor: 'white', color: '#008069' }}>
                                        {(selectedUser?.name || 'U').charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="600">
                                            {selectedUser?.name || 'Unknown User'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            {selectedConversation.title}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Controls */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {selectionMode && selectedMessages.length > 0 ? (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => setDeleteDialogOpen(true)}
                                            sx={{ bgcolor: '#d32f2f' }}
                                        >
                                            Delete ({selectedMessages.length})
                                        </Button>
                                    ) : (
                                        !selectionMode && (
                                            <IconButton
                                                onClick={() => setDeleteConversationDialogOpen(true)}
                                                sx={{ color: 'white' }}
                                                title="Delete Conversation"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )
                                    )}
                                    <IconButton
                                        onClick={() => {
                                            setSelectionMode(!selectionMode);
                                            setSelectedMessages([]);
                                        }}
                                        sx={{ color: 'white' }}
                                        title={selectionMode ? "Cancel Selection" : "Select Messages"}
                                    >
                                        {selectionMode ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedConversation(null);
                                            setSelectedUser(null);
                                            setSelectionMode(false);
                                            setSelectedMessages([]);
                                        }}
                                        sx={{ color: 'white' }}
                                        title="Close Chat"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Messages Area */}
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                p: 3,
                                bgcolor: '#f5f5f5ff',
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}>
                                <Container maxWidth="lg">
                                    {chatMessages.map((msg, idx) => {
                                        const isAdmin = msg.sender === 'admin';
                                        const isSelected = selectedMessages.includes(msg.id);

                                        return (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                                                    mb: 1.5,
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                {selectionMode && !isAdmin && (
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleToggleMessage(msg.id)}
                                                        sx={{ color: 'rgba(0,0,0,0.4)' }}
                                                    />
                                                )}

                                                <Paper
                                                    sx={{
                                                        p: 1.5,
                                                        maxWidth: '65%',
                                                        bgcolor: isSelected ? '#b3e5fc' : (isAdmin ? '#dcf8c6' : 'white'),
                                                        borderRadius: 2,
                                                        boxShadow: 1,
                                                        cursor: selectionMode && !isAdmin ? 'pointer' : 'default',
                                                    }}
                                                    onClick={() => selectionMode && !isAdmin && handleToggleMessage(msg.id)}
                                                >
                                                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                                        {msg.content}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
                                                    >
                                                        {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                                                    </Typography>
                                                </Paper>

                                                {selectionMode && isAdmin && (
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleToggleMessage(msg.id)}
                                                        sx={{ color: 'rgba(0,0,0,0.4)' }}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </Container>
                            </Box>

                            {/* Input Area */}
                            <Box sx={{ bgcolor: '#f0f0f0', borderTop: '1px solid #e0e0e0' }}>
                                <Container maxWidth="lg">
                                    <Box
                                        component="form"
                                        onSubmit={handleSend}
                                        sx={{ py: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}
                                    >
                                        <TextField
                                            fullWidth
                                            placeholder="Type a message"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            size="small"
                                            disabled={selectionMode}
                                            sx={{
                                                bgcolor: 'white',
                                                borderRadius: 3,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                }
                                            }}
                                        />
                                        <IconButton
                                            type="submit"
                                            color="primary"
                                            disabled={selectionMode}
                                            sx={{
                                                bgcolor: '#008069',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: '#006d5b',
                                                },
                                                '&:disabled': {
                                                    bgcolor: '#ccc',
                                                }
                                            }}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Box>
                                </Container>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Delete Messages Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Messages</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''}?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteMessages} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Conversation Confirmation Dialog */}
            <Dialog
                open={deleteConversationDialogOpen}
                onClose={() => setDeleteConversationDialogOpen(false)}
            >
                <DialogTitle>Delete Conversation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this entire conversation?
                        All messages will be permanently removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConversationDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConversation} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
