import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  useTheme,
  CssBaseline,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { keyframes } from '@mui/system';
import { hrService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import LeaveRequestSection from '../components/LeaveRequestSection';
import HRSidebar from '../components/HRSidebar';
import EmployeeListSection from '../components/EmployeeListSection';
import EmployeeDistributionChart from '../components/EmployeeDistributionChart';
import { ROUTES } from '../config/constants';
import { LoadingSpinner } from '../components/LoadingSpinner';

const drawerWidth = 240;

const waveAnimation = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const HRDashboard = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [internCategories, setInternCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState('');

  // Employee list state moved from EmployeeListSection
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errorEmployees, setErrorEmployees] = useState('');

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    category: '',
    role: 'employee',
    isIntern: false,
    password: '',
  });

  const [activeSection, setActiveSection] = useState('employees');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [currentIcon, setCurrentIcon] = useState(0);

  // Fetch Employees moved from EmployeeListSection
  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      setErrorEmployees('');
      const response = await hrService.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorEmployees('Failed to fetch employees');
      toast.error('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setErrorCategories('');
      const response = await hrService.getAllCategories();
      const allCategories = Array.isArray(response) ? response : [];
      setCategories(allCategories);
      const main = allCategories.filter(cat => !cat.isInternCategory);
      const intern = allCategories.filter(cat => cat.isInternCategory);
      setMainCategories(main);
      setInternCategories(intern);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorCategories('Failed to fetch categories');
      toast.error('Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchCategories();
  }, [fetchEmployees, fetchCategories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    const redirectTo = logout();
    navigate(redirectTo);
  };

  const handleOpenEmployeeDialog = (employee = null) => {
    console.log('handleOpenEmployeeDialog called. Employee object:', employee);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        position: employee.position || '',
        department: employee.department || '',
        category: employee.category?._id || employee.category || '',
        role: employee.role || 'employee',
        isIntern: employee.isIntern || false,
        password: '',
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: '',
        category: '',
        role: 'employee',
        isIntern: false,
        password: '',
      });
    }
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    setSelectedEmployee(null);
    console.log('handleCloseEmployeeDialog called. selectedEmployee set to:', null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      department: '',
      category: '',
      role: 'employee',
      isIntern: false,
      password: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'isIntern') {
      const isInternValue = value === 'true';
      setFormData({
        ...formData,
        isIntern: isInternValue,
        category: '',
        position: ''
      });
    } else if (name === 'category') {
      const selectedCategory = categories.find(cat => cat._id === value);
      setFormData({
        ...formData,
        [name]: value,
        position: selectedCategory ? selectedCategory.name : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form. selectedEmployee at start:', selectedEmployee);
    try {
      const dataToSubmit = { ...formData };
      
      console.log('Data to submit:', dataToSubmit);

      // Check if selectedEmployee is set and has an _id for update
      if (selectedEmployee && selectedEmployee._id) {
        console.log('Attempting to update employee. selectedEmployee:', selectedEmployee);
        console.log('Attempting to update employee. selectedEmployee._id:', selectedEmployee._id);
        // Ensure the ID is not added to dataToSubmit, it's only for the URL
        if (dataToSubmit._id) {
            delete dataToSubmit._id;
        }
        if (!dataToSubmit.password) {
          delete dataToSubmit.password;
        }
        await hrService.updateEmployee(selectedEmployee._id, dataToSubmit);
        toast.success('Employee updated successfully');
      } else {
        console.log('Attempting to create new employee.');
        // ... password check for new employee ...
        if (!dataToSubmit.password) {
            setErrorEmployees('Password is required for new employees');
            toast.error('Password is required for new employees');
            return;
          }
        await hrService.createEmployee(dataToSubmit);
        toast.success('Employee created successfully');
      }
      
      handleCloseEmployeeDialog();
      fetchEmployees(); // Re-fetch employees after successful save/update
    } catch (error) {
      console.error('Error saving employee:', error);
      if (error.response?.status === 403) {
        setErrorEmployees('You do not have permission to update employee profiles');
        toast.error('You do not have permission to update employee profiles');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save employee';
        setErrorEmployees(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    // This function can be removed if not used elsewhere in HRDashboard
    // and used directly in EmployeeListSection which receives categories as prop
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'N/A';
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const getAnimatedIcon = () => {
    const iconStyle = {
      fontSize: 32,
      color: 'primary.main',
      transformOrigin: 'center',
    };

    switch (currentIcon) {
      case 0:
        return (
          <WavingHandIcon 
            sx={{ 
              ...iconStyle,
              animation: `${waveAnimation} 2.5s ease-in-out infinite`,
              transformOrigin: '70% 70%'
            }} 
          />
        );
      case 1:
        return (
          <GroupsIcon 
            sx={{ 
              ...iconStyle,
              animation: `${floatAnimation} 3s ease-in-out infinite`
            }} 
          />
        );
      case 2:
        return (
          <AssignmentIcon 
            sx={{ 
              ...iconStyle,
              animation: `${pulseAnimation} 2s ease-in-out infinite`
            }} 
          />
        );
      case 3:
        return (
          <EmojiEventsIcon 
            sx={{ 
              ...iconStyle,
              animation: `${rotateAnimation} 4s linear infinite`
            }} 
          />
        );
      default:
        return null;
    }
  };

  // Combine loading and error states for display
  const overallLoading = loadingCategories || loadingEmployees;
  const overallError = errorCategories || errorEmployees;

  if (overallLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <LoadingSpinner message="Loading dashboard data..." />
      </Box>
    );
  }

  if (overallError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{errorCategories || errorEmployees}</Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <HRSidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
        onAddEmployeeClick={handleOpenEmployeeDialog} 
        onLogoutClick={handleLogout} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.background.default,
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          {/* Header Section */}
          <Box sx={{ 
            p: 3, 
            mb: 3,
            display: 'flex', 
            flexDirection: 'column',
            gap: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            {/* Top Row - Welcome and Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Welcome back, {user?.firstName || 'HR Manager'}!
                </Typography>
                {getAnimatedIcon()}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<NotificationsIcon />}
                  label="Notifications"
                  variant="outlined"
                  onClick={() => setShowNotifications(!showNotifications)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
                <Chip
                  icon={<SettingsIcon />}
                  label="Settings"
                  variant="outlined"
                  onClick={() => setShowSettings(!showSettings)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          {(errorCategories || errorEmployees) && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                mb: 2,
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              {errorCategories || errorEmployees}
            </Alert>
          )}

          <Box sx={{ mt: 2, height: 'calc(100% - 160px)' }}>
            {activeSection === 'employees' && (
              <Box>
                <EmployeeDistributionChart />
                <EmployeeListSection 
                  employees={employees} 
                  loading={loadingEmployees} 
                  error={errorEmployees} 
                  categories={categories}
                  handleOpenEmployeeDialog={handleOpenEmployeeDialog} 
                  fetchEmployees={fetchEmployees}
                />
              </Box>
            )}
            {activeSection === 'leaveRequests' && (
              <LeaveRequestSection />
            )}
          </Box>
        </Container>
      </Box>

      <Dialog 
        open={openEmployeeDialog} 
        onClose={handleCloseEmployeeDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 2
        }}>
          {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={(e) => handleSubmit(e)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!selectedEmployee}
                  helperText={selectedEmployee ? "Leave blank to keep current password" : "Password is required for new employees"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Position Type</InputLabel>
                  <Select
                    name="isIntern"
                    value={formData.isIntern.toString()}
                    onChange={handleChange}
                    label="Position Type"
                  >
                    <MenuItem value="false">Permanent</MenuItem>
                    <MenuItem value="true">Intern</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {formData.isIntern ? (
                      internCategories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))
                    ) : (
                      mainCategories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>
                    {formData.isIntern ? 'Select an intern category' : 'Select a permanent category'}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseEmployeeDialog}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            type="submit"
            variant="contained" 
            color="primary"
            sx={{
              px: 3,
              borderRadius: 2,
            }}
          >
            {selectedEmployee ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRDashboard; 