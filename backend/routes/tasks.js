const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

// Create task (Senior Project Manager only)
router.post('/', protect, authorize('employee'), taskController.createTask);

// Get tasks for a specific project
router.get('/project/:projectId', protect, taskController.getProjectTasks);

// Get tasks assigned to the logged-in user
router.get('/assigned', protect, taskController.getAssignedTasks);

// Update task status
router.put('/:id/status', protect, taskController.updateTaskStatus);

// Delete task (Senior Project Manager only)
router.delete('/:id', protect, authorize('employee'), taskController.deleteTask);

module.exports = router; 