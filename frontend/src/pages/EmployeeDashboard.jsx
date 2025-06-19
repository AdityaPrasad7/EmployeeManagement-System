import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  CssBaseline,
  TextField,
  IconButton,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { employeeService } from '../services/api';
import { toast } from 'react-toastify';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import LeaveRequest from '../components/LeaveRequest';
import ProjectList from '../components/projects/ProjectList';
import LeaveBalance from '../components/LeaveBalance';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveRequestList from '../components/LeaveRequestList';
import EmployeeSidebar from '../components/EmployeeSidebar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { LoadingSpinner } from '../components/LoadingSpinner';

const EmployeeDashboard = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState(() => {
    // Initialize activeSection from localStorage or default to 'profile'
    return localStorage.getItem('activeSection') || 'profile';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getProfile();
      console.log('Full profile response:', response);
      console.log('Category data:', response?.data?.user?.category);
      
      if (response?.data?.user) {
        setProfile(response.data.user);
      } else if (response?.user) {
        setProfile(response.user);
      } else if (response?.data?.profile) {
        setProfile(response.data.profile);
      } else if (response?.profile) {
        setProfile(response.profile);
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('Invalid profile data received');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to fetch profile');
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const redirectTo = logout();
    navigate(redirectTo);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <LoadingSpinner message="Loading your profile..." />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <EmployeeSidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
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
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            {error}
          </Alert>
        )}

        {profile && (
            <>
              {activeSection === 'profile' && (
                <>
            {/* Profile Header */}
                  <Grid item xs={12} sx={{ mb: 3 }}>
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 2,
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                      }}
                    >
                      <CardContent>
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {profile.firstName} {profile.lastName}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          icon={<WorkIcon />}
                          label={profile.position}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<BusinessIcon />}
                          label={profile.department}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CategoryIcon />}
                          label={profile.category?.name || 'No Category'}
                          color="info"
                          variant="outlined"
                        />
                        <Chip
                          icon={<PersonIcon />}
                          label={profile.isIntern ? 'Intern' : 'Full-time'}
                          color={profile.isIntern ? 'warning' : 'success'}
                          variant="outlined"
                        />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

                  {/* Three Sections */}
              <Grid container spacing={3}>
                {/* Personal Information */}
                    <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                      borderRadius: 2,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          }
                        }}
                      >
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                            <PersonIcon color="primary" sx={{ fontSize: 22 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Personal Information
                        </Typography>
                      </Box>
                          <Divider sx={{ mb: 1.75 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                            <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {profile.firstName} {profile.lastName}
                          </Typography>
                                </Box>
                            <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {profile.email}
                          </Typography>
                                </Box>
                            <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                                  <Chip
                                    label={profile.role.toUpperCase()}
                                    color="primary"
                                    size="small"
                                sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                            <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {profile._id}
                                  </Typography>
                                </Box>
                            <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" color="text.secondary">Join Date</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                        </Typography>
                      </Box>
                            <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                              <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {profile.emergencyContact?.name || 'Not provided'}
                          </Typography>
                                  {profile.emergencyContact?.phone && (
                                <Typography variant="body2" color="text.secondary">
                                      {profile.emergencyContact.phone}
                          </Typography>
                                  )}
                                </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Skills Section */}
                    <Grid item xs={12} md={4}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          }
                        }}
                      >
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                            <WorkIcon color="primary" sx={{ fontSize: 22 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Skills
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 1.75 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Add Skill"
                              variant="outlined"
                              InputProps={{
                                endAdornment: (
                                  <IconButton color="primary">
                                    <AddIcon />
                                  </IconButton>
                                ),
                              }}
                            />
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {profile.skills?.map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  onDelete={() => {}}
                                  color="primary"
                                  variant="outlined"
                                />
                              )) || (
                                <Typography variant="body2" color="text.secondary">
                                  No skills added yet
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Education Section */}
                    <Grid item xs={12} md={4}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          }
                        }}
                      >
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                            <SchoolIcon color="primary" sx={{ fontSize: 22 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Education
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 1.75 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Degree/Course"
                              variant="outlined"
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="Institution"
                              variant="outlined"
                            />
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Start Year"
                                  type="number"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="End Year"
                                  type="number"
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              fullWidth
                              size="small"
                            >
                              Add Education
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Certifications Section */}
                    <Grid item xs={12}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          }
                        }}
                      >
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                            <BadgeIcon color="primary" sx={{ fontSize: 22 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Certifications
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 1.75 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Certification Name"
                              variant="outlined"
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="Issuing Organization"
                              variant="outlined"
                            />
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Issue Date"
                                  type="date"
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Expiry Date"
                                  type="date"
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                            <TextField
                              fullWidth
                              size="small"
                              label="Credential ID"
                              variant="outlined"
                            />
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              fullWidth
                              size="small"
                            >
                              Add Certification
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              )}

              {activeSection === 'projects' && (
                <Grid container spacing={2}>
            <Grid item xs={12}>
              <ProjectList />
            </Grid>
          </Grid>
              )}

              {activeSection === 'leaveRequests' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <LeaveRequest />
                  </Grid>
                </Grid>
              )}
            </>
        )}
      </Container>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard; 