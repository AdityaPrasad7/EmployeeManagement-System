import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import { getEmployeeLeaveRequests } from '../services/leaveService';
import { toast } from 'react-toastify';
import { format, isPast, differenceInDays } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

const EmployeeLeaveHistory = () => {
  const theme = useTheme();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    totalDays: 0
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEmployeeLeaveRequests();
      const requests = response.leaveRequests || [];
      console.log("EmployeeLeaveHistory: Fetched requests from service:", requests);
      setLeaveHistory(requests);

      // Calculate statistics
      const newStats = requests.reduce((acc, request) => {
        acc.total++;
        acc[request.status]++;
        acc.totalDays += request.days;
        return acc;
      }, { total: 0, approved: 0, rejected: 0, pending: 0, totalDays: 0 });
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching leave history:', error);
      setError('Failed to fetch leave history.');
      toast.error('Failed to fetch leave history.');
      setLeaveHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleLeaveStatusChange = () => {
      fetchHistory();
    };
    window.addEventListener('leaveStatusChanged', handleLeaveStatusChange);
    return () => {
      window.removeEventListener('leaveStatusChanged', handleLeaveStatusChange);
    };
  }, []);

  const getStatusText = (status, endDate) => {
    if (status === 'pending' && isPast(new Date(endDate))) {
      return 'Not Accepted';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }

  if (leaveHistory.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        No leave history found.
      </Typography>
    );
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">{stats.total}</Typography>
            <Typography variant="body2">Total Requests</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h6">{stats.approved}</Typography>
            <Typography variant="body2">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h6">{stats.rejected}</Typography>
            <Typography variant="body2">Rejected</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="h6">{stats.pending}</Typography>
            <Typography variant="body2">Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Leave History Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveHistory.map((request) => (
              <TableRow key={request._id} hover>
                <TableCell>{format(new Date(request.startDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(request.endDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Chip
                    label={request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                    size="small"
                    color={request.type === 'casual' ? 'primary' : request.type === 'sick' ? 'error' : request.type === 'lop' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{request.days}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(request.status)}
                    label={getStatusText(request.status, request.endDate)}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={request.reason || 'No reason provided'}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                      {request.reason || 'No reason provided'}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={`${request.days} days`}>
                    <Typography variant="body2">
                      {differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1} days
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeLeaveHistory; 