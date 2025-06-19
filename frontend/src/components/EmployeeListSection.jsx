import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  useTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloseIcon from '@mui/icons-material/Close';
import { hrService } from '../services/api';
import { getEmployeeLeaveHistory } from '../services/leaveService';
import { toast } from 'react-toastify';

const EmployeeListSection = ({ employees, loading, error, categories, handleOpenEmployeeDialog, fetchEmployees }) => {
  const theme = useTheme();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loadingLeaveHistory, setLoadingLeaveHistory] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await hrService.deleteEmployee(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'N/A';
  };

  const handleViewLeaveHistory = async (employee) => {
    try {
      setLoadingLeaveHistory(true);
      setSelectedEmployee(employee);
      const response = await getEmployeeLeaveHistory(employee._id);
      console.log('Leave history response:', response);
      const leaveRequests = response.leaveRequests || [];
      console.log('Processed leave requests:', leaveRequests);
      setLeaveHistory(leaveRequests);
      setLeaveDialogOpen(true);
    } catch (error) {
      console.error('Error fetching leave history:', error);
      toast.error('Failed to fetch leave history');
    } finally {
      setLoadingLeaveHistory(false);
    }
  };

  const getLeaveStats = (leaveRequests) => {
    const stats = {
      total: leaveRequests.length,
      approved: leaveRequests.filter(req => req.status === 'approved').length,
      pending: leaveRequests.filter(req => req.status === 'pending').length,
      rejected: leaveRequests.filter(req => req.status === 'rejected').length,
      byMonth: {}
    };

    // Calculate leaves by month
    leaveRequests.forEach(request => {
      if (request.status === 'approved') {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        const month = startDate.toLocaleString('default', { month: 'short' });
        
        // Calculate the number of days between start and end date
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        
        if (!stats.byMonth[month]) {
          stats.byMonth[month] = 0;
        }
        stats.byMonth[month] += diffDays;
      }
    });

    return stats;
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

  if (!employees || employees.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        No employees found.
      </Typography>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', mt: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Leave Details</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee._id}
                sx={{
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '1rem',
                      }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.department}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={<CategoryIcon />}
                    label={getCategoryName(employee.category)}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<WorkIcon />}
                    label={employee.isIntern ? 'Intern' : 'Full Time'}
                    color={employee.isIntern ? 'warning' : 'success'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EventNoteIcon />}
                    onClick={() => handleViewLeaveHistory(employee)}
                    sx={{ minWidth: '120px' }}
                  >
                    View Details
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Tooltip title="Edit Employee">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEmployeeDialog(employee)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Employee">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(employee._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Leave History Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Leave History - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setLeaveDialogOpen(false)}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loadingLeaveHistory ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Leave Statistics */}
              {leaveHistory.length > 0 && (
                <Box mb={4}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Leave Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          border: '1px solid',
                          borderColor: theme.palette.grey[200],
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[1]
                          }
                        }}
                      >
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                          {getLeaveStats(leaveHistory).total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Total Requests
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          border: '1px solid',
                          borderColor: theme.palette.grey[200],
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[1]
                          }
                        }}
                      >
                        <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                          {getLeaveStats(leaveHistory).approved}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Approved
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          border: '1px solid',
                          borderColor: theme.palette.grey[200],
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[1]
                          }
                        }}
                      >
                        <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                          {getLeaveStats(leaveHistory).pending}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Pending Request
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          border: '1px solid',
                          borderColor: theme.palette.grey[200],
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[1]
                          }
                        }}
                      >
                        <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                          {getLeaveStats(leaveHistory).rejected}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Rejected
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Monthly Breakdown */}
              {Object.keys(getLeaveStats(leaveHistory).byMonth).length > 0 && (
                <Box mb={4}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Monthly Leave Trends
                  </Typography>
                  <Grid container spacing={3}>
                    {Object.entries(getLeaveStats(leaveHistory).byMonth).map(([month, days]) => (
                      <Grid item xs={12} sm={6} md={4} key={month}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.grey[200],
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[1]
                            }
                          }}
                          onClick={() => setSelectedMonth(month)}
                        >
                          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                            {month}
                          </Typography>
                          <Typography variant="h5" color="primary.main" sx={{ mt: 0.5, fontWeight: 700 }}>
                            {days} {days === 1 ? 'Day' : 'Days'}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  {selectedMonth && (
                    <Button 
                      onClick={() => setSelectedMonth(null)} 
                      sx={{ mt: 3 }}
                      variant="outlined"
                      color="primary"
                    >
                      Show All Leaves
                    </Button>
                  )}
                </Box>
              )}

              {/* Leave History Table */}
              <TableContainer 
                component={Paper} 
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'white' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Conditional rendering for displayed leaves */}
                    {selectedMonth ? (
                      leaveHistory.filter(leave => 
                        new Date(leave.startDate).toLocaleString('default', { month: 'short' }) === selectedMonth
                      ).length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, bgcolor: 'background.paper' }}>
                            <Typography variant="body1" color="text.secondary">
                              No leave requests found for {selectedMonth}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                        leaveHistory.filter(leave => 
                          new Date(leave.startDate).toLocaleString('default', { month: 'short' }) === selectedMonth
                        ).map((leave, index) => (
                          <TableRow 
                            key={leave._id}
                            sx={{
                              bgcolor: theme.palette.background.paper,
                              '&:hover': {
                                bgcolor: theme.palette.action.hover,
                              },
                              transition: 'background-color 0.2s ease-in-out',
                            }}
                          >
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {new Date(leave.startDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {new Date(leave.endDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Chip
                                label={leave.type.toUpperCase()}
                                color={leave.type === 'casual' ? 'primary' : leave.type === 'sick' ? 'error' : leave.type === 'lop' ? 'success' : 'info'}
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: '20px' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                            <Chip
                              label={leave.status.toUpperCase()}
                              color={
                                leave.status === 'approved'
                                  ? 'success'
                                  : leave.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                              }
                                variant="filled"
                              size="small"
                                sx={{ fontWeight: 600, borderRadius: '20px' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Box
                                sx={{
                                  cursor: 'pointer',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 200,
                                  fontSize: '0.875rem',
                                  color: 'text.primary',
                                  transition: 'color 0.2s ease-in-out',
                                  '&:hover': {
                                    whiteSpace: 'normal',
                                    overflow: 'visible',
                                    maxWidth: 'none',
                                    textDecoration: 'underline',
                                    color: 'primary.main',
                                  }
                                }}
                                title={leave.reason} // Show full reason on hover
                              >
                                {leave.reason}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    ) : ( /* If no month is selected, show all leaves */
                      leaveHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, bgcolor: 'background.paper' }}>
                            <Typography variant="body1" color="text.secondary">
                              No leave requests found for this employee
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveHistory.map((leave, index) => (
                          <TableRow 
                            key={leave._id}
                            sx={{
                              bgcolor: theme.palette.background.paper,
                              '&:hover': {
                                bgcolor: theme.palette.action.hover,
                              },
                              transition: 'background-color 0.2s ease-in-out',
                            }}
                          >
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {new Date(leave.startDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {new Date(leave.endDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Chip
                                label={leave.type.toUpperCase()}
                                color={leave.type === 'casual' ? 'primary' : leave.type === 'sick' ? 'error' : leave.type === 'lop' ? 'success' : 'info'}
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: '20px' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Chip
                                label={leave.status.toUpperCase()}
                                color={
                                  leave.status === 'approved'
                                    ? 'success'
                                    : leave.status === 'pending'
                                    ? 'warning'
                                    : 'error'
                                }
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: '20px' }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                              <Box
                                sx={{
                                  cursor: 'pointer',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 200,
                                  fontSize: '0.875rem',
                                  color: 'text.primary',
                                  transition: 'color 0.2s ease-in-out',
                                  '&:hover': {
                                    whiteSpace: 'normal',
                                    overflow: 'visible',
                                    maxWidth: 'none',
                                    textDecoration: 'underline',
                                    color: 'primary.main',
                                  }
                                }}
                                title={leave.reason} // Show full reason on hover
                              >
                                {leave.reason}
                              </Box>
                            </TableCell>
                        </TableRow>
                      ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setLeaveDialogOpen(false)}
            variant="contained"
            color="primary"
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeListSection; 