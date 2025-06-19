import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { employeeService } from '../services/api';
import { toast } from 'react-toastify';

const LeaveBalance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveBalance, setLeaveBalance] = useState(null);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getLeaveBalance();
      setLeaveBalance(response.leaveBalance);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch leave balance');
      toast.error(error.response?.data?.message || 'Failed to fetch leave balance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Leave Balance
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center" p={1}>
              <Typography variant="h4" color="primary">
                {leaveBalance?.annual || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Annual Leave
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center" p={1}>
              <Typography variant="h4" color="primary">
                {leaveBalance?.sick || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Sick Leave
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center" p={1}>
              <Typography variant="h4" color="primary">
                {leaveBalance?.unpaid || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Unpaid Leave
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LeaveBalance; 