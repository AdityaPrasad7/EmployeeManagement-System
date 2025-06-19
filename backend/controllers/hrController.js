const User = require('../models/User');
const Category = require('../models/Category');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' });
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      department,
      position,
      category,
      isIntern,
      password
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !department || !position || !category || !password) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          department: !department,
          position: !position,
          category: !category,
          password: !password
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Create new employee
    const employee = new User({
      firstName,
      lastName,
      email,
      password, // This will be hashed by the pre-save middleware
      department,
      position,
      category,
      isIntern: isIntern || false,
      role: 'employee'
    });

    await employee.save();

    // Send success response with password
    res.status(201).json({
      message: 'Employee created successfully',
      employee: employee
    });

    // Log the created employee for debugging
    console.log('Created employee:', {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      role: employee.role
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ 
      message: 'Error creating employee',
      error: error.message 
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    // Check if the user is HR
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR can update employee profiles' });
    }

    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Validate category if it's being updated
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Update fields
    const allowedUpdates = ['firstName', 'lastName', 'email', 'department', 'position', 'category', 'isIntern', 'password'];
    
    // Only update fields that are provided and allowed
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'password' && req.body[key]) {
          // Only update password if a new one is provided
          employee[key] = req.body[key];
        } else if (key !== 'password') {
          // Update all other fields
          employee[key] = req.body[key];
        }
      }
    });

    await employee.save();
    
    // Send response without password
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;
    
    res.json(employeeResponse);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ 
      message: 'Update failed', 
      error: error.message,
      details: error.stack 
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset employee password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const employeeId = req.params.id;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const employee = await User.findOne({ _id: employeeId, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.password = password;
    await employee.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetPassword
}; 