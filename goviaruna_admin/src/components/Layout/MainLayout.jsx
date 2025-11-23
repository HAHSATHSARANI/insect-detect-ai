// src/components/Layout/MainLayout.jsx
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ user, currentPage, onPageChange, onLogout, children }) => {
    const sidebarWidth = 230; // matches Sidebar width

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar
                user={user}
                currentPage={currentPage}
                onPageChange={onPageChange}
                onLogout={onLogout}
            />

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: `${sidebarWidth}px`, // move content after sidebar
                    p: 3,
                    bgcolor: 'background.default',
                    minHeight: '100vh',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};
