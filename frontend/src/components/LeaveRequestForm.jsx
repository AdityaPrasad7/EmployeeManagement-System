import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { employeeService } from '../services/api';
import { toast } from 'react-toastify';

const LeaveRequestForm = () => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await employeeService.createLeaveRequest(formData);
      toast.success('Leave request submitted successfully');
      setFormData({
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit leave request');
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Submit Leave Request
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Leave Type"
              required
            >
              <MenuItem value="casual">Casual Leave</MenuItem>
              <MenuItem value="sick">Sick Leave</MenuItem>
              <MenuItem value="lop">Lop leave</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="date"
            name="startDate"
            label="Start Date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            type="date"
            name="endDate"
            label="End Date"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            name="reason"
            label="Reason"
            value={formData.reason}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm; 