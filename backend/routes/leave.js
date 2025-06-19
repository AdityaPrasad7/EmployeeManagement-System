const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// Employee routes (accessible to both HR and employees)
router.get('/balance', protect, leaveController.getLeaveBalance);
router.get('/', protect, leaveController.getAuthenticatedUserLeaveRequests);
router.post('/', protect, leaveController.createLeaveRequest);
router.put('/:id/dates', protect, leaveController.updateLeaveRequestDates);
router.delete('/:id', protect, leaveController.cancelLeaveRequest);

// HR-only routes
router.get('/all', protect, authorize('hr'), leaveController.getAllLeaveRequests);
router.get('/employee/:employeeId', protect, authorize('hr'), leaveController.getEmployeeLeaveRequests);
router.put('/:id/approve', protect, authorize('hr'), leaveController.approveLeaveRequest);
router.put('/:id/reject', protect, authorize('hr'), leaveController.rejectLeaveRequest);

module.exports = router; 