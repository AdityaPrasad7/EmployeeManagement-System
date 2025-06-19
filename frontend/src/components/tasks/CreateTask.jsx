import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { createTask } from '../../services/taskService';
import { toast } from 'react-toastify';

const CreateTask = ({ open, onClose, projectId, assignedEmployees, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!formData.title || !formData.description || !formData.assignedToId || !formData.dueDate) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await createTask({
        ...formData,
        projectId,
        dueDate: new Date(formData.dueDate).toISOString()
      });

      if (response?.success) {
        onTaskCreated(response.task);
        toast.success('Task created successfully');
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          assignedToId: '',
          dueDate: ''
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task');
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form before closing
    setFormData({
      title: '',
      description: '',
      assignedToId: '',
      dueDate: ''
    });
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      aria-labelledby="create-task-dialog-title"
      aria-describedby="create-task-dialog-description"
    >
      <DialogTitle id="create-task-dialog-title">Create New Task</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent id="create-task-dialog-description">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{
                'aria-label': 'Task Title'
              }}
            />
            <TextField
              name="description"
              label="Task Description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={3}
              inputProps={{
                'aria-label': 'Task Description'
              }}
            />
            <FormControl fullWidth required>
              <InputLabel id="assigned-to-label">Assign To</InputLabel>
              <Select
                name="assignedToId"
                value={formData.assignedToId}
                onChange={handleChange}
                labelId="assigned-to-label"
                label="Assign To"
                inputProps={{
                  'aria-label': 'Assign To'
                }}
              >
                {assignedEmployees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="dueDate"
              label="Due Date"
              type="datetime-local"
              value={formData.dueDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                'aria-label': 'Due Date'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} aria-label="Cancel">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            aria-label={loading ? 'Creating Task' : 'Create Task'}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTask; 