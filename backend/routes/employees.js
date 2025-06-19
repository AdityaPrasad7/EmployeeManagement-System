const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

// All routes are protected
router.use(protect);

// Employee routes
router.get('/profile', employeeController.getProfile);
router.patch('/profile', employeeController.updateProfile);

module.exports = router; 