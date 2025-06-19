import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box } from '@mui/material';
import CreateProject from '../components/projects/CreateProject';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/constants';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate(ROUTES.EMPLOYEE_DASHBOARD);
  };

  const handleProjectCreated = () => {
    handleClose();
  };

  // Check if user is a Senior Project Manager
  if (user?.category?.name !== 'Senior Project Manager') {
    navigate(ROUTES.EMPLOYEE_DASHBOARD);
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1">
            Create New Project
          </Typography>
        </Box>
        <CreateProject
          open={open}
          onClose={handleClose}
          onProjectCreated={handleProjectCreated}
        />
      </Paper>
    </Container>
  );
};

export default CreateProjectPage; 