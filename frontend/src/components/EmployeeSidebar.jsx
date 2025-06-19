import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, Button, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

const EmployeeSidebar = ({ activeSection, onSectionChange, onLogoutClick }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
          {user?.firstName?.[0]}{user?.lastName?.[0]}
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
          Employee Dashboard
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeSection === 'profile'}
              onClick={() => onSectionChange('profile')}
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
                primary="Profile" 
                primaryTypographyProps={{
                  sx: { fontWeight: activeSection === 'profile' ? 600 : 400 }
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeSection === 'projects'}
              onClick={() => onSectionChange('projects')}
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
                <WorkIcon sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Projects" 
                primaryTypographyProps={{
                  sx: { fontWeight: activeSection === 'projects' ? 600 : 400 }
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
                transitionDelay: '0.6s',
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
                <EventNoteIcon sx={{ color: 'white' }} />
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
        transitionDelay: '0.7s',
        flexShrink: 0,
      }}>
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

export default EmployeeSidebar; 