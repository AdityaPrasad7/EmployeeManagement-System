const User = require('../models/User');
const Leave = require('../models/Leave');

// Get employee profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('category', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profile: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update employee profile
const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    
    // Fetch updated user with populated category
    const updatedUser = await User.findById(req.user._id)
      .select('-password')
      .populate('category', 'name');
    
    res.json({ profile: updatedUser });
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
};

// Get employee's leave requests
const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ leaveRequests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit leave request
const submitLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;

    const leaveRequest = new Leave({
      employee: req.user._id,
      startDate,
      endDate,
      type,
      reason,
      status: 'pending'
    });

    await leaveRequest.save();
    res.status(201).json({ leaveRequest });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(400).json({ message: 'Failed to submit leave request' });
  }
};

// Cancel leave request
const cancelLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await Leave.findOne({
      _id: req.params.id,
      employee: req.user._id
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave requests' });
    }

    await leaveRequest.deleteOne();
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLeaveRequests,
  submitLeaveRequest,
  cancelLeaveRequest
}; 