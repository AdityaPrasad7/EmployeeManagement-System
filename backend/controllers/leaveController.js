const Leave = require('../models/Leave');
const User = require('../models/User');
const { differenceInDays } = require('date-fns');

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await Leave.find()
      .populate('employee', 'firstName lastName department')
      .sort({ createdAt: -1 });
    res.json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query; // Get month and year from query parameters

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let startDate, endDate;
    let displayMonthName = '';

    if (month && year) {
      // Use provided month and year for filtering
      const targetDate = new Date(year, month - 1); // Month is 0-indexed in JS Date
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      displayMonthName = targetDate.toLocaleString('default', { month: 'long' });
    } else {
      // Default to current month if no month/year provided
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      displayMonthName = now.toLocaleString('default', { month: 'long' });
    }

    // Get approved leave requests for the specified month
    const leaveRequests = await Leave.find({
      employee: userId,
      status: 'approved',
      startDate: { $gte: startDate },
      endDate: { $lte: endDate }
    });

    // Calculate used leave days by type for current month
    const usedLeave = {
      casual: 0,
      sick: 0,
      lop: 0
    };

    leaveRequests.forEach(request => {
      usedLeave[request.type] += request.days;
    });

    // Return only used leave counts for current month
    const leaveBalance = {
      casual: {
        used: usedLeave.casual
      },
      sick: {
        used: usedLeave.sick
      },
      lop: {
        used: usedLeave.lop
      },
      currentMonth: displayMonthName
    };

    res.json({ leaveBalance });
  } catch (error) {
    console.error('Error getting leave balance:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query; // Get month and year from query parameters

    let query = { employee: employeeId };

    if (month && year) {
      const targetDate = new Date(year, month - 1); // Month is 0-indexed in JS Date
      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      query.startDate = { $gte: startDate };
      query.endDate = { $lte: endDate };
    }

    const leaveRequests = await Leave.find(query)
      .populate('employee', 'firstName lastName department')
      .sort({ createdAt: -1 });
    res.json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    const employeeId = req.user._id;

    // Validate type against the new enum values
    if (!['casual', 'sick', 'lop'].includes(type)) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

    const leaveRequest = new Leave({
      employee: employeeId,
      startDate,
      endDate,
      days,
      type,
      reason,
      status: 'pending'
    });

    await leaveRequest.save();
    res.status(201).json({ leaveRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await Leave.findById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = 'approved';
    await leaveRequest.save();
    
    res.json({ leaveRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await Leave.findById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = 'rejected';
    await leaveRequest.save();
    
    res.json({ leaveRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateLeaveRequestDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Parse dates and validate
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (parsedStartDate > parsedEndDate) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow updating dates for pending requests
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update dates for pending leave requests' });
    }

    const days = differenceInDays(parsedEndDate, parsedStartDate) + 1;
    
    leaveRequest.startDate = parsedStartDate;
    leaveRequest.endDate = parsedEndDate;
    leaveRequest.days = days;
    
    await leaveRequest.save();
    res.json({ leaveRequest });
  } catch (error) {
    console.error('Error updating leave request dates:', error);
    res.status(500).json({ 
      message: 'Error updating leave request dates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.getRecentLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await Leave.find()
      .populate('employee', 'firstName lastName department')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuthenticatedUserLeaveRequests = async (req, res) => {
  try {
    const userId = req.user._id; // Get the ID of the authenticated user
    const leaveRequests = await Leave.find({ employee: userId })
      .populate('employee', 'firstName lastName department')
      .sort({ createdAt: -1 });
    res.json({ leaveRequests });
  } catch (error) {
    console.error('Error fetching authenticated user leave requests:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await Leave.findById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow canceling pending requests
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave requests' });
    }

    await leaveRequest.deleteOne();
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 