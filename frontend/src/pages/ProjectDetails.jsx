import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Autocomplete,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { getProject, updateProjectStatus, getAvailableEmployees, assignEmployees, removeEmployee } from '../services/projectService';
import { getProjectTasks } from '../services/taskService';
import TaskList from '../components/tasks/TaskList';
import CreateTask from '../components/tasks/CreateTask';
import TaskManagementDialog from '../components/tasks/TaskManagementDialog';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import { ROUTES } from '../config/constants';
import { LoadingSpinner } from '../components/LoadingSpinner';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [taskManagementOpen, setTaskManagementOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchProject();
        await fetchTasks();
        // Only fetch available employees if user is a Senior Project Manager
        if (user?.category?.name === 'Senior Project Manager') {
          await fetchAvailableEmployees();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch project data');
        toast.error(error.message || 'Failed to fetch project data');
      }
    };

    fetchData();
  }, [id, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      console.log('Fetching project with ID:', id);
      const response = await getProject(id);
      console.log('Project response:', response);
      
      if (response?.success && response?.project) {
        console.log('Setting project:', response.project);
        setProject(response.project);
      } else {
        console.error('Invalid project response:', response);
        setError('Project not found');
        toast.error('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.message || 'Failed to fetch project details');
      toast.error(error.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await getAvailableEmployees();
      console.log('Employees response:', response);
      
      if (response?.success && Array.isArray(response?.employees)) {
        console.log('Setting employees:', response.employees);
        setAvailableEmployees(response.employees);
      } else {
        console.log('No employees found in response');
        setAvailableEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(error.message || 'Failed to fetch employees');
      setAvailableEmployees([]);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getProjectTasks(id);
      if (response.success) {
        // Check if user exists and has the correct role
        const isManager = user?.category?.name === 'Senior Project Manager';
        
        if (!isManager) {
          // For non-managers, only show tasks assigned to them
          setTasks(response.tasks.filter(task => 
            task.assignedTo && task.assignedTo._id === user?.id
          ));
        } else {
          // For managers, show all tasks
          setTasks(response.tasks);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      console.log('Changing project status to:', newStatus);
      const response = await updateProjectStatus(id, newStatus);
      console.log('Status update response:', response);

      // Update the local state immediately since we know the backend update was successful
      setProject(prevProject => ({
        ...prevProject,
        status: newStatus
      }));
      toast.success('Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error(error.message || 'Failed to update project status');
      // Refresh the project data to ensure UI is in sync
      await fetchProject();
    }
  };

  const handleAssignEmployees = async () => {
    try {
      const employeeIds = selectedEmployees.map(emp => emp._id);
      console.log('Assigning employees:', { projectId: id, employeeIds });
      
      const response = await assignEmployees(id, employeeIds);
      console.log('Assign employees response:', response);
      
      if (response?.success && response?.project) {
        console.log('Updating project with:', response.project);
        // Update the local state with the complete project data from the response
        setProject(response.project);
        setSelectedEmployees([]);
        // Show the appropriate message
        toast.success(response.message || 'Employees assigned successfully');
      } else {
        // Show warning for already assigned employees
        if (response?.message?.includes('already assigned')) {
          toast.warning(response.message);
        } else {
          console.error('Invalid response format:', response);
          throw new Error(response?.message || 'Invalid response from server');
        }
      }
    } catch (error) {
      console.error('Error assigning employees:', error);
      // Show warning for already assigned employees
      if (error.message?.includes('already assigned')) {
        toast.warning(error.message);
      } else {
        toast.error(error.message || 'Failed to assign employees');
      }
      // Refresh the project data to ensure UI is in sync
      await fetchProject();
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    try {
      console.log('Removing employee:', employeeId);
      const response = await removeEmployee(id, employeeId);
      console.log('Remove employee response:', response);
      
      if (response?.success && response?.project) {
        setProject(response.project);
        toast.success(response.message || 'Employee removed successfully');
      } else {
        throw new Error(response?.message || 'Failed to remove employee');
      }
    } catch (error) {
      console.error('Error removing employee:', error);
      toast.error(error.message || 'Failed to remove employee');
      await fetchProject();
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setTaskManagementOpen(true);
  };

  const getEmployeeTasks = (employeeId) => {
    return tasks.filter(task => task.assignedTo?._id === employeeId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'on-hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredEmployees = availableEmployees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LoadingSpinner message="Loading project details..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: 'background.paper' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              onClick={() => {
                navigate(ROUTES.EMPLOYEE_DASHBOARD);
                // Set the active section to 'projects' in localStorage
                localStorage.setItem('activeSection', 'projects');
              }}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {project.name}
            </Typography>
          </Box>
          <Chip
            label={project.status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(project.status)}
            sx={{ 
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '20px 10px'
            }}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ mb: 4, backgroundColor: 'background.default' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Description
            </Typography>
                </Stack>
                <Typography paragraph sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {project.description}
            </Typography>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ mb: 4, backgroundColor: 'background.default' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Timeline
            </Typography>
                </Stack>
            <Typography variant="body1" color="text.secondary">
              Deadline: {project.deadline && !isNaN(new Date(project.deadline).getTime()) 
                ? format(new Date(project.deadline), 'PPP p') 
                : 'No deadline set'}
            </Typography>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ mb: 4, backgroundColor: 'background.default' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <GroupIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Assigned Employees
            </Typography>
                </Stack>
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              {project.assignedEmployees.map((assignment) => (
                <Chip
                  key={assignment.employee?._id || Math.random()}
                  label={assignment.employee 
                    ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
                    : 'Unknown Employee'}
                  variant="outlined"
                  onDelete={user?.category?.name === 'Senior Project Manager' 
                    ? () => handleRemoveEmployee(assignment.employee._id)
                    : undefined}
                      sx={{ 
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                />
              ))}
            </Box>
              </CardContent>
            </Card>

            {user?.category?.name === 'Senior Project Manager' && (
              <Card elevation={0} sx={{ mb: 4, backgroundColor: 'background.default' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Task Management
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setCreateTaskOpen(true)}
                      startIcon={<AssignmentIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      Create Task
                    </Button>
                  </Stack>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: 'text.secondary',
                        '&.Mui-focused': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      Select Employee
                    </InputLabel>
                    <Select
                      value={selectedEmployee?._id || ''}
                      label="Select Employee"
                      onChange={(e) => {
                        const employee = project.assignedEmployees.find(
                          assignment => assignment.employee._id === e.target.value
                        )?.employee;
                        handleEmployeeSelect(employee);
                      }}
                      sx={{
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                          borderRadius: 2
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            mt: 1,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '& .MuiMenuItem-root': {
                              py: 1.5,
                              px: 2
                            }
                          }
                        }
                      }}
                    >
                      {project.assignedEmployees.map((assignment) => (
                        <MenuItem 
                          key={assignment.employee._id} 
                          value={assignment.employee._id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'action.selected',
                              '&:hover': {
                                backgroundColor: 'action.selected'
                              }
                            }
                          }}
                        >
                          <PersonIcon fontSize="small" color="primary" />
                          <Typography>
                            {assignment.employee.firstName} {assignment.employee.lastName}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            {user?.category?.name === 'Senior Project Manager' ? (
              <>
                <Card elevation={0} sx={{ mb: 4, backgroundColor: 'background.default' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <AssignmentIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Status
                  </Typography>
                    </Stack>
                    <Stack spacing={2}>
                    <Button
                      variant={project.status === 'pending' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange('pending')}
                        fullWidth
                        sx={{ 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          py: 1.5,
                          borderRadius: 2
                        }}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={project.status === 'in-progress' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange('in-progress')}
                        fullWidth
                        sx={{ 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          py: 1.5,
                          borderRadius: 2
                        }}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={project.status === 'completed' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange('completed')}
                        fullWidth
                        sx={{ 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          py: 1.5,
                          borderRadius: 2
                        }}
                    >
                      Completed
                    </Button>
                    <Button
                      variant={project.status === 'on-hold' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange('on-hold')}
                        fullWidth
                        sx={{ 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          py: 1.5,
                          borderRadius: 2
                        }}
                    >
                      On Hold
                    </Button>
                    </Stack>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ mb: 4, backgroundColor: 'background.default' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                      <GroupIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Assign Employees
                  </Typography>
                    </Stack>
                  <Autocomplete
                    multiple
                      id="assign-employees"
                    options={availableEmployees}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    value={selectedEmployees}
                      onChange={(event, newValue) => {
                        setSelectedEmployees(newValue);
                      }}
                      filterOptions={(options, { inputValue }) => {
                        const searchTerm = inputValue.toLowerCase();
                        return options.filter((option) => 
                          option.firstName.toLowerCase().includes(searchTerm) ||
                          option.lastName.toLowerCase().includes(searchTerm) ||
                          option.email.toLowerCase().includes(searchTerm)
                        );
                      }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search employees"
                          variant="outlined"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                                borderWidth: 2
                              }
                            }
                          }}
                        />
                      )}
                      renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                          <li {...otherProps} key={option.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {option.firstName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1">{option.firstName} {option.lastName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.email}
                                </Typography>
                              </Box>
                            </Box>
                          </li>
                        );
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option._id}
                            label={`${option.firstName} ${option.lastName}`}
                            icon={<PersonIcon />}
                            sx={{
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          />
                        ))
                      }
                    noOptionsText="No employees found"
                    loadingText="Loading employees..."
                      sx={{ mb: 2 }}
                      PaperComponent={({ children, ...props }) => (
                        <Paper
                          {...props}
                          sx={{
                            mt: 1,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        >
                          {children}
                        </Paper>
                      )}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAssignEmployees}
                    disabled={selectedEmployees.length === 0}
                    fullWidth
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      Assign Employees
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card elevation={0} sx={{ backgroundColor: 'background.default' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  My Tasks
                </Typography>
                <TaskList
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>

      {user?.category?.name === 'Senior Project Manager' && (
        <>
        <CreateTask
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          projectId={id}
          assignedEmployees={project?.assignedEmployees?.map(assignment => assignment.employee) || []}
          onTaskCreated={handleTaskCreated}
        />
          <TaskManagementDialog
            open={taskManagementOpen}
            onClose={() => {
              setTaskManagementOpen(false);
              setSelectedEmployee(null);
            }}
            employee={selectedEmployee}
            tasks={selectedEmployee ? getEmployeeTasks(selectedEmployee._id) : []}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </>
      )}
    </Container>
  );
};

export default ProjectDetails; 