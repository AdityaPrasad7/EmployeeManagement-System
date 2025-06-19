const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const Category = require('../models/Category');

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('category', 'name');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        position: user.position,
        category: user.category,
        isIntern: user.isIntern
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register controller
const register = async (req, res) => {
  try {
    // Log the incoming request
    console.log('Received registration request:', {
      ...req.body,
      password: '[REDACTED]'
    });

    // Validate required fields
    const requiredFields = ['email', 'password', 'role', 'firstName', 'lastName', 'department', 'position', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    const { email, password, role, firstName, lastName, department, position, category } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate category
    console.log('Checking category:', category);
    
    if (!mongoose.Types.ObjectId.isValid(category)) {
      console.log('Invalid category ID format:', category);
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    // List all categories for debugging
    const allCategories = await Category.find({});
    console.log('Available categories:', allCategories.map(cat => ({
      id: cat._id,
      name: cat.name
    })));

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.log('Category not found:', category);
      return res.status(400).json({ 
        message: 'Category not found',
        availableCategories: allCategories.map(cat => ({
          id: cat._id,
          name: cat.name
        }))
      });
    }

    console.log('Category found:', categoryExists);

    // Create new user
    const userData = {
      email,
      password,
      role,
      firstName,
      lastName,
      department,
      position,
      category
    };

    console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });

    const user = new User(userData);

    // Save user
    const savedUser = await user.save();
    console.log('User created successfully:', savedUser._id);

    // Return success response
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        department: savedUser.department,
        position: savedUser.position
      }
    });

  } catch (error) {
    // Log the full error
    console.error('Registration error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });

    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    // Generic error response with more details
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      errorName: error.name,
      errorCode: error.code
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('category', 'name');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        position: user.position,
        category: user.category,
        isIntern: user.isIntern
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Since we're using JWT, we don't need to do anything on the server
    // The client should remove the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  register,
  getCurrentUser,
  logout
}; 