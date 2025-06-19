import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { employeeService } from '../services/api';
import { toast } from 'react-toastify';

const LeaveRequestList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getLeaveRequests();
      setLeaveRequests(response.leaveRequests);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch leave requests');
      toast.error(error.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
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
          Leave Requests
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {request.type}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.startDate), 'PPP')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.endDate), 'PPP')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestList; 