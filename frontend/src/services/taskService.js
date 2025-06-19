import api from './api';

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create task' };
  }
};

// Get tasks for a specific project
export const getProjectTasks = async (projectId) => {
  try {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch project tasks' };
  }
};

// Get tasks assigned to the logged-in user
export const getAssignedTasks = async () => {
  try {
    const response = await api.get('/tasks/assigned');
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch assigned tasks' };
  }
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update task status' };
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response?.data || response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete task' };
  }
}; 