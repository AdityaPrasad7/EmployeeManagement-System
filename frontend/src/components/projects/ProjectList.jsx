import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getManagerProjects, getEmployeeProjects, deleteProject } from '../../services/projectService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ProjectList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startTime = Date.now();
      
      try {
        console.log('Current user:', user);
        
        let response;
        if (user?.category?.name === 'Senior Project Manager') {
          console.log('Fetching manager projects');
          response = await getManagerProjects();
        } else {
          console.log('Fetching employee projects');
          response = await getEmployeeProjects();
        }

        console.log('Project fetch response:', response);

        if (response?.projects) {
          setProjects(response.projects);
        } else if (response?.data?.projects) {
          setProjects(response.data.projects);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.message || 'Failed to fetch projects');
        toast.error(error.message || 'Failed to fetch projects');
        setProjects([]);
      }

      // Calculate remaining time to ensure minimum 0.5s loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 700 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setLoading(false);
    };

    fetchData();
  }, [location.key]);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteClick = (event, project) => {
    event.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProject(projectToDelete._id);
      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p._id !== projectToDelete._id));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not_started':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
      >
        <Fade in={loading}>
          <CircularProgress />
        </Fade>
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
    <>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6">
            {user?.category?.name === 'Senior Project Manager' ? 'All Projects' : 'Assigned Projects'}
          </Typography>
          {user?.category?.name === 'Senior Project Manager' && (
            <Button
              variant="contained"
              onClick={() => navigate('/projects/create')}
            >
              Create New Project
            </Button>
          )}
        </Box>

        {user?.category?.name === 'Senior Project Manager' && (
          <TextField
            fullWidth
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remaining Days</TableCell>
                {user?.category?.name === 'Senior Project Manager' && (
                  <TableCell>Assigned Employees</TableCell>
                )}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <TableRow
                    key={project._id}
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleProjectClick(project._id)}
                  >
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={remainingDays > 0 ? `${remainingDays} days left` : 'Overdue'}
                        color={remainingDays > 0 ? 'primary' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    {user?.category?.name === 'Senior Project Manager' && (
                      <TableCell>
                        <Chip
                          label={`${project.assignedEmployees?.length || 0} Employees`}
                          color="info"
                          size="small"
                        />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(project._id);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {user?.category?.name === 'Senior Project Manager' && (
                          <Tooltip title="Delete Project">
                            <IconButton
                              size="small"
                              onClick={(e) => handleDeleteClick(e, project)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.lighter'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={user?.category?.name === 'Senior Project Manager' ? 5 : 4}>
                    <Typography color="text.secondary" align="center">
                      {user?.category?.name === 'Senior Project Manager'
                        ? 'No projects created yet'
                        : 'No projects assigned yet'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Project
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectList;
