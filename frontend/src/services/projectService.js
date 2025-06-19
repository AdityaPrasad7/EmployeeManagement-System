import api from './api';

// Create a new project
export const createProject = async (data) => {
  try {
    const response = await api.post('/projects', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create project' };
  }
};

// Get all projects for a manager (projects created by the logged-in manager)
export const getManagerProjects = async () => {
  try {
    const response = await api.get('/projects/manager');
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch projects' };
  }
};

// Get a single project by ID
export const getProject = async (id) => {
  try {
    console.log('Fetching project with ID:', id);
    const response = await api.get(`/projects/${id}`);
    console.log('Project service response:', response);
    return response;
  } catch (error) {
    console.error('Error in getProject service:', error);
    throw error.response?.data || { message: 'Failed to fetch project' };
  }
};

// Update project status
export const updateProjectStatus = async (id, status) => {
  try {
    console.log('Updating project status:', { id, status });
    const response = await api.put(`/projects/${id}/status`, { status });
    console.log('Status update response:', response);
    return response.data;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error.response?.data || { message: 'Failed to update project status' };
  }
};

// Get available employees for assignment
export const getAvailableEmployees = async () => {
  try {
    console.log('Fetching employees from service...');
    const response = await api.get('/projects/available-employees');
    console.log('Service response:', response);
    return response;
  } catch (error) {
    console.error('Error in getAvailableEmployees service:', error);
    throw error.response?.data || { message: 'Failed to fetch employees' };
  }
};

// Assign employees to project
export const assignEmployees = async (projectId, employeeIds) => {
  try {
    console.log('Assigning employees:', { projectId, employeeIds });
    const response = await api.post(`/projects/${projectId}/assign`, { employeeIds });
    console.log('Assign employees response:', response);
    return response;
  } catch (error) {
    console.error('Error in assignEmployees service:', error);
    throw error.response?.data || { message: 'Failed to assign employees' };
  }
};

// Get projects assigned to an employee (the logged-in user)
export const getEmployeeProjects = async () => {
  try {
    const response = await api.get('/projects/employee/assigned');
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch assigned projects' };
  }
};

export const removeEmployee = async (projectId, employeeId) => {
  try {
    console.log('Removing employee from project:', { projectId, employeeId });
    const response = await api.delete(`/projects/${projectId}/employees/${employeeId}`);
    console.log('Remove employee response:', response);
    return response;
  } catch (error) {
    console.error('Error in removeEmployee service:', error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    console.log('Deleting project:', projectId);
    const response = await api.delete(`/projects/${projectId}`);
    console.log('Delete project response:', response);
    return response;
  } catch (error) {
    console.error('Error in deleteProject service:', error);
    throw error.response?.data || { message: 'Failed to delete project' };
  }
};