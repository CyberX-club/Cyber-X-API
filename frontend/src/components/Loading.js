import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ loading = true, message = 'Loading...' }) => {
    if (!loading) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 9999,
            }}
        >
            <CircularProgress size={60} />
            {message && (
                <Typography
                    variant="h6"
                    sx={{ mt: 2, color: 'text.secondary' }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default Loading;