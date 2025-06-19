import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, Button, Tooltip, Avatar, Badge } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import { getAllLeaveRequests } from '../services/leaveService';

const drawerWidth = 240;

const HRSidebar = ({ activeSection, onSectionChange, onAddEmployeeClick, onLogoutClick }) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchPendingRequests();
    // Set up polling for new requests every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);

    // Add event listener for leave status changes
    const handleLeaveStatusChange = () => {
      fetchPendingRequests();
    };
    window.addEventListener('leaveStatusChanged', handleLeaveStatusChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('leaveStatusChanged', handleLeaveStatusChange);
    };
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await getAllLeaveRequests();
      const uniqueEmployeesWithPendingRequests = new Set(
        response.leaveRequests
          .filter(request => request.status === 'pending' && request.employee && request.employee._id)
          .map(request => request.employee._id)
      );
      setPendingRequests(uniqueEmployeesWithPendingRequests.size);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          border: 'none',
          boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s ease-in-out',
          transitionDelay: '0.6s',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            mb: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transform: isOpen ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.5s ease-in-out',
            transitionDelay: '0.2s',
          }}
        >
          <BusinessIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            textAlign: 'center',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease-in-out',
            transitionDelay: '0.3s',
          }}
        >
          HR Dashboard
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeSection === 'employees'}
              onClick={() => onSectionChange('employees')}
              sx={{
                borderRadius: 2,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'all 0.5s ease-in-out',
                transitionDelay: '0.4s',
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="All Employees" 
                primaryTypographyProps={{
                  sx: { fontWeight: activeSection === 'employees' ? 600 : 400 }
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeSection === 'leaveRequests'}
              onClick={() => onSectionChange('leaveRequests')}
              sx={{
                borderRadius: 2,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'all 0.5s ease-in-out',
                transitionDelay: '0.5s',
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Badge 
                  badgeContent={pendingRequests} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -3,
                      top: 3,
                      border: '2px solid white',
                      padding: '0 4px',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #ff5252 30%, #ff1744 90%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      animation: pendingRequests > 0 ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(255, 23, 68, 0.4)',
                        },
                        '70%': {
                          boxShadow: '0 0 0 6px rgba(255, 23, 68, 0)',
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(255, 23, 68, 0)',
                        },
                      },
                    }
                  }}
                >
                  <EventNoteIcon sx={{ color: 'white' }} />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary="Leave Requests" 
                primaryTypographyProps={{
                  sx: { fontWeight: activeSection === 'leaveRequests' ? 600 : 400 }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ 
        p: 2, 
        background: 'rgba(0,0,0,0.1)',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease-in-out',
        transitionDelay: '0.6s',
        flexShrink: 0,
      }}>
        <Tooltip title="Add New Employee" placement="right">
          <Button
            variant="contained"
            onClick={() => onAddEmployeeClick(null)}
            startIcon={<AddIcon />}
            fullWidth
            sx={{ 
              mb: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Employee
          </Button>
        </Tooltip>
        <Button
          variant="outlined"
          onClick={onLogoutClick}
          startIcon={<LogoutIcon />}
          fullWidth
          sx={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'white',
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            },
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default HRSidebar; 