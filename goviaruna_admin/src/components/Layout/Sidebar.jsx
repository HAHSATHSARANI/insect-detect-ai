// src/components/Layout/Sidebar.jsx
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Divider } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    BugReport as BugReportIcon,
    SupervisorAccount as SupervisorAccountIcon,
    People as PeopleIcon,
    Forum as CommunityIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

export const Sidebar = ({ user, currentPage, onPageChange, onLogout }) => {
    const menuItems = [
        { label: 'Dashboard', icon: DashboardIcon },
        { label: 'Insects', icon: BugReportIcon },
        { label: 'Farmers', icon: PeopleIcon },
        { label: 'Admins', icon: SupervisorAccountIcon },
        { label: 'Community', icon: CommunityIcon },
    ];

    return (
        <Box
            sx={{
                width: 280,
                bgcolor: 'white',
                height: '100vh',
                borderRight: '1px solid',
                borderColor: 'grey.200',
                position: 'fixed',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Top Section */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    src={user.imageUrl}
                    sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}
                >
                    {user.name?.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="body1" fontWeight={600}>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.role || 'Admin'}</Typography>
                </Box>
            </Box>
            <Divider />

            {/* Menu Items */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List sx={{ px: 2, py: 1 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={currentPage === item.label}
                                onClick={() => onPageChange(item.label)}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.main' }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <item.icon sx={{ color: currentPage === item.label ? 'white' : 'text.secondary' }} />
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Logout at Bottom */}
            <Box sx={{ p: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={onLogout} sx={{ borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <LogoutIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Box>
    );
};
