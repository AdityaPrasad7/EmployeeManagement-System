const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const hrController = require('../controllers/hrController');

// All routes are protected and require HR role
router.use(protect);
router.use(authorize('hr'));

// HR routes
router.get('/employees', hrController.getAllEmployees);
router.post('/employees', hrController.createEmployee);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deleteEmployee);
router.put('/employees/:id/password', hrController.resetPassword);

module.exports = router; 