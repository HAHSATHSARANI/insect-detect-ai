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
    CheckBox as CheckBoxIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export default function CommunityPage() {
    // List of users who have chatted with their latest message
    const [users, setUsers] = useState([]);
    // Messages for the selected user
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Selected user to chat with
    const [selectedUser, setSelectedUser] = useState(null);
    const selectedUserRef = useRef(null); // Ref to access selectedUser in interval closures
    const lastReadTimeRef = useRef({}); // Ref to track last read timestamp for each user
    const scrollRef = useRef(null);

    // Update ref when state changes
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // Update lastReadTimeRef when chatMessages update for selected user
    useEffect(() => {
        if (selectedUser && chatMessages.length > 0) {
            const lastMsg = chatMessages[chatMessages.length - 1];
            if (lastMsg && lastMsg.timestamp) {
                lastReadTimeRef.current = {
                    ...lastReadTimeRef.current,
                    [selectedUser]: lastMsg.timestamp
                };
            }
        }
    }, [selectedUser, chatMessages]);

    // Message selection and deletion
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Fetch list of users with their latest messages and unread count
    const loadUsers = async () => {
        try {
            const res = await fetch(`${API}/chat/users`);
            if (res.ok) {
                const userList = await res.json();

                // Fetch latest message for each user
                const usersWithDetails = await Promise.all(
                    userList.map(async (username) => {
                        try {
                            const chatRes = await fetch(`${API}/chat/${username}`);
                            if (chatRes.ok) {
                                const messages = await chatRes.json();
                                const latestMessage = messages[messages.length - 1];

                                // Get local last read time
                                const lastRead = lastReadTimeRef.current[username];

                                // Count unread messages from user only
                                let unreadCount = messages.filter(m => {
                                    if (m.sender !== 'user') return false;
                                    if (m.read) return false; // If marked as read by backend, it's read

                                    // If backend says unread, check our local timestamp
                                    // If we have seen a message with this timestamp or newer, it's read
                                    if (lastRead && m.timestamp && new Date(m.timestamp) <= new Date(lastRead)) {
                                        return false;
                                    }
                                    return true;
                                }).length;

                                // If this is the currently selected user, force unread count to 0
                                if (username === selectedUserRef.current) {
                                    unreadCount = 0;
                                }

                                return {
                                    username,
                                    latestMessage: latestMessage?.content || 'No messages',
                                    timestamp: latestMessage?.timestamp,
                                    unreadCount
                                };
                            }
                        } catch (err) {
                            console.error(`Failed to load messages for ${username}`, err);
                        }
                        return { username, latestMessage: 'No messages', timestamp: null, unreadCount: 0 };
                    })
                );

                setUsers(usersWithDetails);
            }
        } catch (err) {
            console.error('Failed to load chat users', err);
        }
    };

    // Fetch chat history for selected user
    const loadChatHistory = async (username) => {
        try {
            const res = await fetch(`${API}/chat/${username}`);
            if (res.ok) {
                const messages = await res.json();
                setChatMessages(messages);
            }
        } catch (err) {
            console.error('Failed to load chat history', err);
        }
    };

    // Mark all unread messages as read when opening a chat
    const markMessagesAsRead = async (username) => {
        // Optimistically update UI first
        setUsers(prevUsers => prevUsers.map(user =>
            user.username === username
                ? { ...user, unreadCount: 0 }
                : user
        ));

        try {
            await fetch(`${API}/chat/${username}/read-all`, {
                method: 'PUT'
            });
            // Reload users to confirm update from backend
            loadUsers();
        } catch (err) {
            console.error('Failed to mark messages as read', err);
        }
    };

    // Initial load + polling every 3 seconds
    useEffect(() => {
        loadUsers();
        const interval = setInterval(loadUsers, 3000);
        return () => clearInterval(interval);
    }, []);

    // Load chat history when user is selected
    useEffect(() => {
        if (selectedUser) {
            loadChatHistory(selectedUser);
            markMessagesAsRead(selectedUser);
            const interval = setInterval(() => loadChatHistory(selectedUser), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    // Auto‑scroll to latest message when chat view updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Send a message to the selected user
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;
        try {
            const res = await fetch(`${API}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: selectedUser,
                    content: newMessage,
                    sender: 'admin'
                }),
            });
            if (res.ok) {
                setNewMessage('');
                loadChatHistory(selectedUser);
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
                loadChatHistory(selectedUser);
                loadUsers();
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

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: '230px',
            right: 0,
            bottom: 0,
            bgcolor: '#f5f7fa',
            overflow: 'hidden',
        }}>
            {/* Chat List View */}
            {!selectedUser && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Page Header */}
                    <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="h4" fontWeight="700">
                            Community Chat
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage conversations with farmers
                        </Typography>
                    </Box>

                    {/* Chat List */}
                    <Container maxWidth="lg" sx={{ flex: 1, py: 3, overflow: 'auto' }}>
                        <Paper sx={{ overflow: 'hidden' }}>
                            <List sx={{ p: 0 }}>
                                {users.length === 0 ? (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No messages yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Use the Test Chat page to add some test messages.
                                        </Typography>
                                    </Box>
                                ) : (
                                    users.map((user, index) => (
                                        <React.Fragment key={user.username}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => setSelectedUser(user.username)}
                                                    sx={{ py: 2, px: 3 }}
                                                >
                                                    <Badge
                                                        badgeContent={user.unreadCount}
                                                        color="primary"
                                                        sx={{ mr: 2 }}
                                                    >
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    </Badge>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="subtitle1" fontWeight={user.unreadCount > 0 ? 700 : 400}>
                                                                {user.username}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: '400px'
                                                                }}
                                                            >
                                                                {user.latestMessage}
                                                            </Typography>
                                                        }
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTimestamp(user.timestamp)}
                                                    </Typography>
                                                </ListItemButton>
                                            </ListItem>
                                            {index < users.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))
                                )}
                            </List>
                        </Paper>
                    </Container>
                </Box>
            )}

            {/* Full Screen Chat View */}
            {selectedUser && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Chat Header */}
                    <Box sx={{
                        p: 2,
                        bgcolor: '#008069',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={() => {
                                setSelectedUser(null);
                                setSelectionMode(false);
                                setSelectedMessages([]);
                            }} sx={{ color: 'white', mr: 2 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Avatar sx={{ mr: 2, bgcolor: 'white', color: '#008069' }}>
                                {selectedUser.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight="600">
                                {selectedUser}
                            </Typography>
                        </Box>

                        {/* Selection Mode Controls */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {selectionMode && selectedMessages.length > 0 && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setDeleteDialogOpen(true)}
                                    sx={{ bgcolor: '#d32f2f' }}
                                >
                                    Delete ({selectedMessages.length})
                                </Button>
                            )}
                            <IconButton
                                onClick={() => {
                                    setSelectionMode(!selectionMode);
                                    setSelectedMessages([]);
                                }}
                                sx={{ color: 'white' }}
                            >
                                {selectionMode ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages Area */}
                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 3,
                        bgcolor: '#e5ddd5',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M50 0L0 50M100 50L50 100\' stroke=\'%23d1c7b7\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bgcolor: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                            },
                        },
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

            {/* Delete Confirmation Dialog */}
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
        </Box>
    );
}
