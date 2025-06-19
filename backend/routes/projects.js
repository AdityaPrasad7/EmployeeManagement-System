const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Manager: Create and view their own projects
router.post('/', protect, authorize('employee'), projectController.createProject);
router.get('/manager', protect, authorize('employee'), projectController.getManagerProjects);
router.get('/employee/assigned', protect, projectController.getEmployeeProjects);

// Project assignments
router.get('/available-employees', protect, projectController.getAvailableEmployees);

// Project details (parameterized routes should come last)
router.get('/:id', protect, projectController.getProject);
router.put('/:id', protect, authorize('employee'), projectController.updateProject);
router.delete('/:id', protect, authorize('employee'), projectController.deleteProject);
router.post('/:id/assign', protect, authorize('employee'), projectController.assignEmployees);
router.delete('/:id/employees/:employeeId', protect, authorize('employee'), projectController.removeEmployee);
router.put('/:id/status', protect, authorize('employee'), projectController.updateProjectStatus);

module.exports = router;
