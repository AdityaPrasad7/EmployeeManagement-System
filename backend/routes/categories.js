const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Category = require('../models/Category');

// All routes are protected
router.use(protect);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get main categories (non-intern)
router.get('/main', async (req, res) => {
  try {
    const categories = await Category.find({ isInternCategory: false }).sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching main categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get intern categories
router.get('/intern', async (req, res) => {
  try {
    const categories = await Category.find({ isInternCategory: true }).sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching intern categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category (HR only)
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR can create categories' });
    }

    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
});

// Update category (HR only)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR can update categories' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
});

// Delete category (HR only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR can delete categories' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router; 