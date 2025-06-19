const Category = require('../models/Category');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get main categories (non-intern)
exports.getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isInternCategory: false })
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get intern categories
exports.getInternCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isInternCategory: true })
      .populate('parentCategory', 'name')
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, isInternCategory, parentCategory } = req.body;

    // If it's an intern category, validate parent category
    if (isInternCategory && !parentCategory) {
      return res.status(400).json({ message: 'Parent category is required for intern categories' });
    }

    const category = new Category({
      name,
      description,
      isInternCategory,
      parentCategory: isInternCategory ? parentCategory : null
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isInternCategory, parentCategory } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    category.name = name || category.name;
    category.description = description || category.description;
    category.isInternCategory = isInternCategory !== undefined ? isInternCategory : category.isInternCategory;
    category.parentCategory = isInternCategory ? parentCategory : null;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has any subcategories
    const hasSubcategories = await Category.exists({ parentCategory: category._id });
    if (hasSubcategories) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories' });
    }

    await category.remove();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 