import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TaskList from './TaskList';

const TaskManagementDialog = ({ open, onClose, employee, tasks, onTaskUpdate, onTaskDelete }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tasks for {employee?.firstName} {employee?.lastName}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Assigned Tasks
            </Typography>
            <TaskList
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
              isManager={true}
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TaskManagementDialog; 