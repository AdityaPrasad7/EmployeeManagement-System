import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { useState, useEffect } from 'react';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // Set a minimum loading time of 1 second
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showSpinner) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      gap={2}
      sx={{
        animation: `${fadeIn} 0.5s ease-in-out`,
      }}
    >
      <CircularProgress 
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography 
        variant="h6" 
        color="text.secondary"
        sx={{
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}; 