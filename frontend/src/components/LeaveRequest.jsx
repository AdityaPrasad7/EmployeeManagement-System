import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkIcon from '@mui/icons-material/Work';
import { toast } from 'react-toastify';
import { submitLeaveRequest, getLeaveBalance, getEmployeeLeaveRequests } from '../services/leaveService';
import HistoryIcon from '@mui/icons-material/History';
import EmployeeLeaveHistory from './EmployeeLeaveHistory';
import { differenceInDays, parseISO } from 'date-fns';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const LeaveRequest = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveData, setLeaveData] = useState({
    type: '',
    reason: '',
    days: 1,
    startDate: '',
    endDate: '',
  });

  const [leaveBalances, setLeaveBalances] = useState({
    casual: { used: 0, pending: 0 },
    sick: { used: 0, pending: 0 },
    lop: { used: 0, pending: 0 },
    currentMonth: ''
  });

  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

  const navigate = useNavigate();

  // New centralized function to fetch all necessary leave data
  const fetchLeaveData = async (month, year) => {
    setLoading(true);
    try {
      const [balanceResponse, allRequestsResponse] = await Promise.all([
        getLeaveBalance(month, year), // Fetch balance for specific month/year
        getEmployeeLeaveRequests() // Always fetch ALL history for trends and total pending
      ]);

      if (balanceResponse.leaveBalance) {
        // Filter all requests by the selected month/year before calculating pending leaves
        const filteredRequests = allRequestsResponse.leaveRequests.filter(request => {
          const requestDate = new Date(request.startDate);
          return requestDate.getMonth() + 1 === month && requestDate.getFullYear() === year;
        });

        const pendingLeaves = {
          casual: 0,
          sick: 0,
          lop: 0
        };

        if (filteredRequests) {
          filteredRequests.forEach(request => {
            if (request.status === 'pending') {
              pendingLeaves[request.type] += request.days;
            }
          });
        }

        console.log("fetchLeaveData: Filtered requests for pending calculation:", filteredRequests);
        console.log("fetchLeaveData: Calculated pending leaves for month (", month, ",", year, "):", pendingLeaves);

        setLeaveBalances({
          casual: {
            ...balanceResponse.leaveBalance.casual,
            pending: pendingLeaves.casual
          },
          sick: {
            ...balanceResponse.leaveBalance.sick,
            pending: pendingLeaves.sick
          },
          lop: {
            ...balanceResponse.leaveBalance.lop,
            pending: pendingLeaves.lop
          },
          currentMonth: balanceResponse.leaveBalance.currentMonth
        });
      }

      if (allRequestsResponse.leaveRequests) {
        console.log("fetchLeaveData: Setting leaveHistory with all requests:", allRequestsResponse.leaveRequests);
        setLeaveHistory(allRequestsResponse.leaveRequests);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast.error('Failed to fetch leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On initial load, fetch for current month/year and all history
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    fetchLeaveData(currentMonth, currentYear);
  }, []);

  // Add event listener for leave status changes (now uses fetchLeaveData)
  useEffect(() => {
    const handleLeaveStatusChange = () => {
      // Refetch data for the currently selected month/year, or current month if none selected
      const monthToFetch = selectedMonth ? new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth() + 1 : new Date().getMonth() + 1;
      const yearToFetch = selectedYear || new Date().getFullYear();
      fetchLeaveData(monthToFetch, yearToFetch);
    };

    window.addEventListener('leaveStatusChanged', handleLeaveStatusChange);
    return () => {
      window.removeEventListener('leaveStatusChanged', handleLeaveStatusChange);
    };
  }, [selectedMonth, selectedYear]); // Depend on selectedMonth/Year for refetch on change

  // Log leaveHistory whenever it changes
  useEffect(() => {
    console.log("Component (LeaveRequest): leaveHistory state updated:", leaveHistory);
  }, [leaveHistory]);

  const getLeaveStats = (leaveRequests) => {
    console.log("getLeaveStats: Processing leave requests for trends:", leaveRequests);
    const stats = {
      total: leaveRequests.length,
      approved: leaveRequests.filter(req => req.status === 'approved').length,
      pending: leaveRequests.filter(req => req.status === 'pending').length,
      rejected: leaveRequests.filter(req => req.status === 'rejected').length,
      byMonth: {}
    };

    // Calculate leaves by month
    leaveRequests.forEach(request => {
      // Include all leave requests (approved, pending, rejected) for monthly trends
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        const month = startDate.toLocaleString('default', { month: 'short' });
      const year = startDate.getFullYear();
      
      const monthYearKey = `${month}-${year}`;

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      console.log(`Processing request for trends: ID=${request._id}, Status=${request.status}, Start=${request.startDate}, End=${request.endDate}, Month=${monthYearKey}, Calculated Days=${diffDays}`);
        
      if (!stats.byMonth[monthYearKey]) {
        stats.byMonth[monthYearKey] = 0;
        }
      stats.byMonth[monthYearKey] += diffDays;
      console.log("Updated byMonth for", monthYearKey, ":", stats.byMonth[monthYearKey]);
    });

    console.log("Final leave stats for trends (byMonth):", stats.byMonth);
    return stats;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLeaveData({
      type: '',
      reason: '',
      days: 1,
      startDate: '',
      endDate: '',
    });
  };

  const handleOpenHistoryDialog = () => {
    setOpenHistoryDialog(true);
  };
  
  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    // When closing history, reset selected month/year and refetch for current month/year
    setSelectedMonth(null);
    setSelectedYear(null);
    const now = new Date();
    fetchLeaveData(now.getMonth() + 1, now.getFullYear());
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) + 1; // +1 to include both start and end dates
    return days > 0 ? days : 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newLeaveData = {
      ...leaveData,
      [name]: value,
    };

    // If start date or end date changes, recalculate days
    if (name === 'startDate' || name === 'endDate') {
      const days = calculateDays(
        name === 'startDate' ? value : leaveData.startDate,
        name === 'endDate' ? value : leaveData.endDate
      );
      newLeaveData.days = days;
    }

    setLeaveData(newLeaveData);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate leave request
      if (!leaveData.type || !leaveData.reason || !leaveData.startDate || !leaveData.endDate) {
        toast.error('All fields are required');
        return;
      }

      if (leaveData.days <= 0) {
        toast.error('Leave days must be greater than 0');
        return;
      }

      // Submit leave request
      await submitLeaveRequest(leaveData);
      
      // Refresh leave balance and history after submission
      console.log('Leave request submitted. Attempting to fetch updated leave balance and history...');
      const now = new Date();
      await fetchLeaveData(now.getMonth() + 1, now.getFullYear()); // Refresh for current month balance and all history
      console.log('handleSubmit: Completed fetching updated leave balance and history.');
      
      toast.success('Leave request submitted successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBalance = (type) => {
    return leaveBalances[type].used;
  };

  return (
    <>
      <Card elevation={3} sx={{ 
        borderRadius: 3,
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)'
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2} 
            mb={3}
            sx={{
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              pb: 2
            }}
          >
            <EventNoteIcon 
              sx={{ 
                fontSize: 32,
                color: 'primary.main',
                background: 'rgba(25, 118, 210, 0.1)',
                borderRadius: '50%',
                p: 1
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '0.5px'
              }}
            >
              Leave Requests
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <EventNoteIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h5" fontWeight="600" color="text.primary">
                Leave Balance - {leaveBalances.currentMonth}
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #A8A4FF 100%)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(108, 92, 231, 0.2)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <WorkIcon sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 24 }} />
                    <Typography variant="subtitle1" color="rgba(255, 255, 255, 0.9)" fontWeight="600">
                      Casual Leave
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="white" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {getAvailableBalance('casual')}
                  </Typography>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ opacity: 0.9 }}>
                    days used this month
                  </Typography>
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                      Pending Request: {leaveBalances.casual.pending} days
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(255, 107, 107, 0.2)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <LocalHospitalIcon sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 24 }} />
                    <Typography variant="subtitle1" color="rgba(255, 255, 255, 0.9)" fontWeight="600">
                      Sick Leave
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="white" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {getAvailableBalance('sick')}
                  </Typography>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ opacity: 0.9 }}>
                    days used this month
                  </Typography>
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                      Pending Request: {leaveBalances.sick.pending} days
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #00B894 0%, #00D1A7 100%)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 184, 148, 0.2)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <EventNoteIcon sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 24 }} />
                    <Typography variant="subtitle1" color="rgba(255, 255, 255, 0.9)" fontWeight="600">
                      Lop Leave
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="white" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {getAvailableBalance('lop')}
                  </Typography>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ opacity: 0.9 }}>
                    days used this month
                  </Typography>
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                      Pending Request: {leaveBalances.lop.pending} days
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {leaveBalances.currentMonth} Leave Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Used: {leaveBalances.casual.used + leaveBalances.sick.used + leaveBalances.lop.used} days
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Pending Request: {leaveBalances.casual.pending + leaveBalances.sick.pending + leaveBalances.lop.pending} days
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Monthly Leave Trends with Leave History */}
          {Object.keys(getLeaveStats(leaveHistory).byMonth).length > 0 && (
            <Box mb={4}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalendarMonthIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Monthly Leave Trends
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'nowrap',
                overflowX: 'auto',
                gap: 1.5,
                p: 2,
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                mb: 3,
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.grey[400],
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: theme.palette.grey[200],
                },
              }}>
                {Object.entries(getLeaveStats(leaveHistory).byMonth).map(([monthYearKey, days]) => {
                  const [month, year] = monthYearKey.split('-');
                  const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1; // Convert short month name to 1-indexed month number
                  return (
                  <Chip
                      key={monthYearKey}
                    label={`${month}: ${days}`}
                      color={selectedMonth === month && selectedYear === parseInt(year) ? "primary" : "default"}
                      onClick={() => {
                        setSelectedMonth(month);
                        setSelectedYear(parseInt(year));
                        console.log(`Chip clicked: Selected Month=${month}, Selected Year=${year}`);
                        // Fetch balance for the selected month/year, history remains all
                        fetchLeaveData(monthIndex, parseInt(year));
                      }}
                    sx={{
                        mb: 1,
                        mr: 1,
                      fontWeight: 600,
                        transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText
                      }
                    }}
                  />
                  );
                })}
                {(selectedMonth || selectedYear) && ( 
                  <Button 
                    onClick={() => {
                      setSelectedMonth(null);
                      setSelectedYear(null); 
                      console.log("Show All clicked: Resetting selectedMonth and selectedYear to null.");
                      fetchLeaveData(new Date().getMonth() + 1, new Date().getFullYear()); 
                    }} 
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<CalendarMonthIcon />}
                    sx={{ ml: 'auto' }}
                  >
                    Show All
                  </Button>
                )}
              </Box>

              <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer sx={{ maxHeight: 229 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'white' }}>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Start Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {console.log("Table Render Check: Current selectedMonth =", selectedMonth, ", selectedYear =", selectedYear, ", leaveHistory items =", leaveHistory.length)}
                      {selectedMonth && selectedYear ? (
                        // Filter when a specific month/year is selected
                        leaveHistory.filter(leave => {
                          const startDate = new Date(leave.startDate);
                          const leaveMonth = startDate.toLocaleString('default', { month: 'short' });
                          const leaveYear = startDate.getFullYear();
                          const isMatch = (leaveMonth === selectedMonth && leaveYear === selectedYear);
                          console.log(`Filtering Request: ID=${leave._id}, Month=${leaveMonth}, Year=${leaveYear}. Selected Month=${selectedMonth}, Selected Year=${selectedYear}. Match: ${isMatch}`);
                          return isMatch;
                        }).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              <Typography variant="body1" color="text.secondary">
                                No leave requests found for {selectedMonth} {selectedYear}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          leaveHistory.filter(leave => {
                            const startDate = new Date(leave.startDate);
                            const leaveMonth = startDate.toLocaleString('default', { month: 'short' });
                            const leaveYear = startDate.getFullYear();
                            return leaveMonth === selectedMonth && leaveYear === selectedYear;
                          }).map((leave, index) => (
                            <TableRow key={leave._id}>
                              <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Chip
                                  label={leave.type.toUpperCase()}
                                  color={leave.type === 'casual' ? 'primary' : leave.type === 'sick' ? 'error' : leave.type === 'lop' ? 'success' : 'default'}
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>{leave.days}</TableCell>
                              <TableCell>
                                <Chip
                                  label={leave.status.toUpperCase()}
                                  color={
                                    leave.status === 'approved' ? 'success' :
                                    leave.status === 'pending' ? 'warning' : 'error'
                                  }
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>{leave.reason}</TableCell>
                            </TableRow>
                          ))
                        )
                      ) : (
                        // This block runs when selectedMonth is null (Show All)
                        console.log("Table Render Check: Showing all leave history (selectedMonth/Year is null)."),
                        leaveHistory.map((leave) => (
                          <TableRow key={leave._id}>
                            <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={leave.type.toUpperCase()}
                                color={leave.type === 'casual' ? 'primary' : leave.type === 'sick' ? 'error' : leave.type === 'lop' ? 'success' : 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>{leave.days}</TableCell>
                            <TableCell>
                              <Chip
                                label={leave.status.toUpperCase()}
                                color={
                                  leave.status === 'approved' ? 'success' :
                                  leave.status === 'pending' ? 'warning' : 'error'
                                }
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>{leave.reason}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}

          <Box mt={4} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
              fullWidth
              startIcon={<EventNoteIcon />}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              Request Leave
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleOpenHistoryDialog}
              fullWidth
              startIcon={<ListAltIcon />}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderColor: 'secondary.main',
                color: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  borderColor: 'secondary.light',
                }
              }}
            >
              Track Leave
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Leave Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            Submit Leave Request
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  name="type"
                  value={leaveData.type}
                  onChange={handleChange}
                  label="Leave Type"
                >
                  <MenuItem value="casual">Casual Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="lop">Lop</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Number of Days"
                type="number"
                name="days"
                value={leaveData.days}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                inputProps={{ min: 1 }}
                disabled // Days are now calculated automatically
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                name="startDate"
                value={leaveData.startDate}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                name="endDate"
                value={leaveData.endDate}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason for Leave"
                name="reason"
                value={leaveData.reason}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handleCloseDialog} color="secondary" variant="outlined" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading} sx={{ fontWeight: 600 }}>
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave History Dialog - Currently not used, but kept for potential future use */}
      <Dialog
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            Employee Leave History
          </Typography>
          <IconButton onClick={handleCloseHistoryDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <EmployeeLeaveHistory />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseHistoryDialog} color="secondary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeaveRequest; 