import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Divider,
  CircularProgress,
  TextField,
  Grid,
  Avatar,
  Badge,
  Paper,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import { getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest, updateLeaveRequestDates } from '../services/leaveService';
import { differenceInDays, parseISO } from 'date-fns';
import { hrService } from '../services/api';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const LeaveRequestsList = () => {
  const theme = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDates, setEditedDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeLeaveRequests, setEmployeeLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editingDates, setEditingDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [expandedRequests, setExpandedRequests] = useState({});
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    startDate: '',
    endDate: ''
  });
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showLeaveHistory, setShowLeaveHistory] = useState(false);
  const [showFullReason, setShowFullReason] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  // Helper functions
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateText = (text, wordCount = 5) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const getFilteredRequests = (employeeId) => {
    if (!employeeId) return [];
    return leaveRequests
      .filter(request => request.employee && request.employee._id === employeeId)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  };

  const getLeaveHistoryStats = (employeeId) => {
    const employeeRequests = getFilteredRequests(employeeId);
    const totalLeaves = employeeRequests.length;
    const approvedLeaves = employeeRequests.filter(req => req.status === 'approved').length;
    const rejectedLeaves = employeeRequests.filter(req => req.status === 'rejected').length;
    
    return {
      total: totalLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves
    };
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await hrService.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  }, []);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllLeaveRequests();
      setLeaveRequests(response.leaveRequests || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, [fetchEmployees, fetchLeaveRequests]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Filter leave requests for the selected employee
    const employeeRequests = leaveRequests.filter(
      request => request.employee && request.employee._id === employee._id
    );
    setEmployeeLeaveRequests(employeeRequests);
  };

  const hasPendingRequests = (employeeId) => {
    return leaveRequests.some(
      request => request.employee && request.employee._id === employeeId && request.status === 'pending'
    );
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setEditedDates({
      startDate: request.startDate.split('T')[0],
      endDate: request.endDate.split('T')[0]
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setIsEditing(false);
  };

  const handleEditDates = () => {
    setIsEditing(true);
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) + 1; // +1 to include both start and end dates
    return days > 0 ? days : 1;
  };

  const handleDialogDateChange = (e) => {
    const { name, value } = e.target;
    const newDates = {
      ...editedDates,
      [name]: value
    };
    setEditedDates(newDates);

    // Calculate new days when either date changes
    if (name === 'startDate' || name === 'endDate') {
      const days = calculateDays(
        name === 'startDate' ? value : editedDates.startDate,
        name === 'endDate' ? value : editedDates.endDate
      );
      // Update the selected request's days
      setSelectedRequest(prev => ({
        ...prev,
        days
      }));
    }
  };

  const handleSaveDates = async () => {
    try {
      // Optimistic update
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === selectedRequest._id 
            ? { 
                ...request, 
                startDate: editedDates.startDate,
                endDate: editedDates.endDate,
                days: calculateDays(editedDates.startDate, editedDates.endDate)
              }
            : request
        )
      );

      const response = await updateLeaveRequestDates(
        selectedRequest._id,
        {
          startDate: editedDates.startDate,
          endDate: editedDates.endDate
        }
      );
      
      // Update with server response
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === selectedRequest._id 
            ? { ...request, ...response.leaveRequest }
            : request
        )
      );

      toast.success('Leave dates updated successfully');
      setIsEditing(false);
      setOpenDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      // Revert optimistic update on error
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === selectedRequest._id 
            ? { ...request, ...selectedRequest }
            : request
        )
      );
      toast.error(error.message || 'Failed to update leave dates');
      console.error('Error updating leave dates:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      // Optimistic update
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === id ? { ...request, status: 'approved' } : request
        )
      );

      const response = await approveLeaveRequest(id);
      
      // Update with server response
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === id ? { ...request, ...response.leaveRequest } : request
        )
      );

      toast.success('Leave request approved');
      handleCloseDialog();
    } catch (error) {
      // Revert optimistic update on error
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === id ? { ...request, status: 'pending' } : request
        )
      );
      toast.error('Failed to approve leave request');
      console.error('Error approving leave request:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      // Optimistic update
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === id ? { ...request, status: 'rejected' } : request
        )
      );

      const response = await rejectLeaveRequest(id);
      
      // Update with server response
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === id ? { ...request, ...response.leaveRequest } : request
        )
      );

      toast.success('Leave request rejected');
      handleCloseDialog();
    } catch (error) {
      // Revert optimistic update on error
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === id ? { ...request, status: 'pending' } : request
        )
      );
      toast.error('Failed to reject leave request');
      console.error('Error rejecting leave request:', error);
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

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'casual':
        return 'primary';
      case 'sick':
        return 'error';
      case 'lop':
        return 'success';
      default:
        return 'default';
    }
  };

  const getEmployeesByRequestStatus = () => {
    const pendingEmployees = employees.filter(employee => 
      leaveRequests.some(request => 
        request.employee && 
        request.employee._id === employee._id && 
        request.status === 'pending'
      )
    );

    const processedEmployees = employees.filter(employee => 
      leaveRequests.some(request => 
        request.employee && 
        request.employee._id === employee._id && 
        (request.status === 'approved' || request.status === 'rejected')
      )
    );

    return { pending: pendingEmployees, processed: processedEmployees };
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await leaveService.updateLeaveRequestStatus(requestId, newStatus);
      setLeaveRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEditClick = (e, request) => {
    e.stopPropagation();
    setSelectedRequest(request);
    setEditForm({
      startDate: request.startDate.split('T')[0],
      endDate: request.endDate.split('T')[0]
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await updateLeaveRequestDates(selectedRequest._id, {
        startDate: editForm.startDate,
        endDate: editForm.endDate
      });

      if (response) {
        // Update the request in the local state
        setLeaveRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === selectedRequest._id 
              ? { ...request, startDate: editForm.startDate, endDate: editForm.endDate }
              : request
          )
        );
        setEditDialogOpen(false);
        setSelectedRequest(null);
        setEditForm({ startDate: '', endDate: '' });
        toast.success('Leave request dates updated successfully');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error(error.response?.data?.message || 'Failed to update leave request dates');
    }
  };

  const toggleExpand = (requestId) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const handleViewAllRequests = (employee) => {
    setSelectedEmployee(employee);
    setShowAllRequests(true);
  };

  const handleBackToPending = () => {
    setShowAllRequests(false);
    setSelectedEmployee(null);
  };

  const handleSeeMore = (reason) => {
    setSelectedReason(reason);
    setShowFullReason(true);
  };

  if (showAllRequests && selectedEmployee) {
    const employeeRequests = leaveRequests
      .filter(request => request.employee && request.employee._id === selectedEmployee._id)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={handleBackToPending} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="medium">
            All Requests - {selectedEmployee.firstName} {selectedEmployee.lastName}
          </Typography>
        </Box>

        {employeeRequests.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No leave requests found for this employee
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {employeeRequests.map(request => (
              <Grid item xs={12} sm={6} md={4} key={request._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: request.status === 'pending' ? 'warning.lighter' : 
                                request.status === 'approved' ? 'success.lighter' : 'error.lighter',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      {request.status === 'pending' && (
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            },
                            zIndex: 1
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(e, request);
                          }}
                        >
                          <EditIcon fontSize="small" color="warning" />
                        </IconButton>
                      )}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} sx={{ pr: request.status === 'pending' ? 4 : 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          color={request.status === 'pending' ? 'warning.dark' :
                                request.status === 'approved' ? 'success.dark' : 'error.dark'}
                        >
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </Typography>
                        <Chip 
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)} 
                          size="small" 
                          color={request.status === 'pending' ? 'warning' :
                                request.status === 'approved' ? 'success' : 'error'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {request.type}
                      </Typography>
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <Typography variant="body2" color="text.primary">
                          {expandedRequests[request._id] ? request.reason : truncateText(request.reason, 5)}
                        </Typography>
                        {request.reason.split(' ').length > 5 && (
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(request._id);
                            }}
                            sx={{ 
                              p: 0, 
                              minWidth: 'auto',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {expandedRequests[request._id] ? 'Show less' : 'See more'}
                          </Button>
                        )}
                      </Box>
                      {request.status === 'pending' && (
                        <Box display="flex" gap={1} mt={2}>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(request._id);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(request._id);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Approve
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  const { pending, processed } = getEmployeesByRequestStatus();

  return (
    <Box sx={{ p: 3 }}>
      {/* Pending Requests Section */}
      <Box mb={4}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'warning.main',
              fontWeight: 600
            }}
          >
            <EventNoteIcon color="warning" />
            Pending Requests
          </Typography>
          <Chip 
            label={`${pending.length} ${pending.length === 1 ? 'Request' : 'Requests'}`}
            color="warning"
            variant="outlined"
          />
        </Box>
        <Grid container spacing={3}>
          {pending.map((employee) => {
            const pendingRequest = leaveRequests.find(
              request => request.employee && request.employee._id === employee._id && request.status === 'pending'
            );
            
            if (!pendingRequest) return null;

            return (
            <Grid item xs={12} sm={6} md={4} key={employee._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                      handleEditClick(e, pendingRequest);
                  }}
                >
                  <EditIcon fontSize="small" color="warning" />
                </IconButton>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Badge
                        badgeContent={leaveRequests.filter(
                          request => request.employee && request.employee._id === employee._id && request.status === 'pending'
                        ).length}
                        color="error"
                        overlap="circular"
                      >
                    <Avatar
                      sx={{
                            bgcolor: 'primary.main',
                        width: 48,
                            height: 48
                      }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Avatar>
                      </Badge>
                    <Box>
                        <Typography variant="h6">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.department}
                      </Typography>
                    </Box>
                  </Box>
                        <Box 
                          sx={{
                            p: 2,
                            bgcolor: 'warning.lighter',
                            borderRadius: 1,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" color="warning.dark">
                          {formatDate(pendingRequest.startDate)} - {formatDate(pendingRequest.endDate)}
                            </Typography>
                        <Chip label="Pending" size="small" color="warning" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                        {pendingRequest.type}
                          </Typography>
                      <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => handleSeeMore(pendingRequest.reason)}
                        >
                          {truncateText(pendingRequest.reason)}
                          {pendingRequest.reason.split(' ').length > 5 && (
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeeMore(pendingRequest.reason);
                              }}
                              sx={{ ml: 1 }}
                            >
                              See More
                            </Button>
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 'auto' }}>
                        <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                              handleReject(pendingRequest._id);
                              }}
                              sx={{ flex: 1 }}
                            >
                              Reject
                            </Button>
                          <Button
                                size="small"
                            variant="contained"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(pendingRequest._id);
                            }}
                                sx={{ flex: 1 }}
                          >
                            Approve
                          </Button>
                            </Box>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAllRequests(employee);
                          }}
                          sx={{ mt: 1 }}
                        >
                          View All Requests
                        </Button>
                        </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            );
          })}
          {pending.length === 0 && (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <EventNoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Pending Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All leave requests have been processed
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Processed Requests Section */}
      
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            <HistoryIcon />
            Processed Requests
          </Typography>
          <Chip 
      label={`${processed.length} ${processed.length === 1 ? 'Employee' : 'Employees'}`}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Grid container spacing={3}>
    {processed.map((employee) => {
      const employeeRequests = leaveRequests.filter(
        request => request.employee && request.employee._id === employee._id
      );
      const stats = {
        total: employeeRequests.length,
        approved: employeeRequests.filter(req => req.status === 'approved').length,
        rejected: employeeRequests.filter(req => req.status === 'rejected').length
      };
      
      if (stats.total === 0) return null;

      return (
            <Grid item xs={12} sm={6} md={4} key={employee._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                        fontSize: '1.2rem'
                      }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.department}
                      </Typography>
                    </Box>
                  </Box>
              
                  <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.lighter' }}>
                    <Typography variant="subtitle2" color="primary.dark">
                      {stats.total}
                            </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                          </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'success.lighter' }}>
                    <Typography variant="subtitle2" color="success.dark">
                      {stats.approved}
                          </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Approved
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'error.lighter' }}>
                    <Typography variant="subtitle2" color="error.dark">
                      {stats.rejected}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Rejected
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<HistoryIcon />}
                onClick={() => {
                  setSelectedEmployee(employee);
                  setShowLeaveHistory(true);
                }}
                sx={{ mt: 1 }}
              >
                View Leave History
              </Button>
                </CardContent>
              </Card>
            </Grid>
      );
    })}
          {processed.length === 0 && (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Processed Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No leave requests have been processed yet
                </Typography>
              </Box>
            </Grid>
          )}
  </Grid>
</Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Processed Requests
        </Typography>
        <Grid container spacing={2}>
          {employees.map((employee) => {
            const stats = getLeaveHistoryStats(employee.id);
            if (stats.total === 0) return null; // Skip employees with no leave history
            
            return (
              <Grid item xs={12} sm={6} md={4} key={employee.id}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {employee.firstName} {employee.lastName}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<HistoryIcon />}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowLeaveHistory(true);
                      }}
                    >
                      Leave History
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Dialog 
  open={showLeaveHistory}
  onClose={() => setShowLeaveHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
    <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
        Leave History - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </Typography>
      <IconButton onClick={() => setShowLeaveHistory(false)}>
        <CloseIcon />
      </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
    <Box sx={{ mb: 3, mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">{getFilteredRequests(selectedEmployee?._id).length}</Typography>
            <Typography variant="body2">Total Leaves</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h6">
              {getFilteredRequests(selectedEmployee?._id).filter(req => req.status === 'approved').length}
                  </Typography>
            <Typography variant="body2">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h6">
              {getFilteredRequests(selectedEmployee?._id).filter(req => req.status === 'rejected').length}
            </Typography>
            <Typography variant="body2">Rejected</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {getFilteredRequests(selectedEmployee?._id).map((request) => (
            <TableRow key={request._id}>
              <TableCell>{formatDate(request.startDate)}</TableCell>
              <TableCell>{formatDate(request.endDate)}</TableCell>
              <TableCell>{request.days}</TableCell>
              <TableCell>
                <Chip 
                  label={request.type} 
                  color={getLeaveTypeColor(request.type)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                  <Chip 
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)} 
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {request.reason && (
                  <Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => handleSeeMore(request.reason)}
                    >
                      {truncateText(request.reason)}
                      {request.reason.split(' ').length > 5 && (
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeeMore(request.reason);
                          }}
                          sx={{ ml: 1 }}
                        >
                          See More
                        </Button>
                      )}
                    </Typography>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
</Dialog>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            zIndex: 1300 // Higher than default z-index
          }
        }}
      >
        <DialogTitle>Edit Leave Dates</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={editForm.startDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={editForm.endDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showFullReason}
        onClose={() => setShowFullReason(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            zIndex: 1300 // Higher than default z-index
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Leave Request Reason</Typography>
            <IconButton onClick={() => setShowFullReason(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
            {selectedReason}
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Leave Request Details</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* ... existing dialog content ... */}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeaveRequestsList; 