const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
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
        position: user.position
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route (HR only)
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      firstName, 
      lastName, 
      department, 
      position,
      category 
    } = req.body;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName || !department || !position || !category) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          email: !email,
          password: !password,
          role: !role,
          firstName: !firstName,
          lastName: !lastName,
          department: !department,
          position: !position,
          category: !category
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      firstName,
      lastName,
      department,
      position,
      category
    });

    await user.save();

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        position: user.position,
        category: user.category
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
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

    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
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
});

module.exports = router;