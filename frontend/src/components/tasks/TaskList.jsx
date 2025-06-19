import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { updateTaskStatus, deleteTask } from '../../services/taskService';

const TaskList = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const isManager = user?.category?.name === 'Senior Project Manager';

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTask) return;

    try {
      setLoading(true);
      const response = await updateTaskStatus(selectedTask._id, newStatus);
      if (response?.success) {
        onTaskUpdate(response.task);
        toast.success('Task status updated successfully');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(error.message || 'Failed to update task status');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    try {
      setLoading(true);
      const response = await deleteTask(selectedTask._id);
      if (response?.success) {
        onTaskDelete(selectedTask._id);
        toast.success('Task deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tasks
      </Typography>
      <List>
        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            {isManager ? 'No tasks created yet' : 'No tasks assigned to you yet'}
          </Typography>
        ) : (
          tasks.map((task, index) => (
            <React.Fragment key={task._id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <Chip
                      label={task.status.toUpperCase()}
                      color={getStatusColor(task.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {isManager && (
                      <IconButton
                        edge="end"
                        aria-label="more"
                        onClick={(e) => handleMenuOpen(e, task)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Box component="span" sx={{ display: 'block' }}>
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                        {task.description}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Due: {formatDate(task.dueDate)}
                      </Typography>
                      {isManager && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < tasks.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('pending')}>Mark as Pending</MenuItem>
        <MenuItem onClick={() => handleStatusChange('in-progress')}>Mark as In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>Mark as Completed</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete Task</MenuItem>
      </Menu>
    </Paper>
  );
};

export default TaskList; 