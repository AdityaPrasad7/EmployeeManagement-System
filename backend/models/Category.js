const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      // Permanent positions
      'HR Manager',
      'Senior Developer',
      'Senior Project Manager',
      'Senior Tester',
      'Business Analyst',
      // Intern positions
      'HR Trainee',
      'Junior Developer',
      'Project Coordinator',
      'QA Trainee',
      'Business Trainee'
    ]
  },
  description: {
    type: String,
    required: true
  },
  isInternCategory: {
    type: Boolean,
    default: false
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
categorySchema.index({ name: 1 });
categorySchema.index({ isInternCategory: 1 });

// Create a compound index to ensure name + isInternCategory combination is unique
categorySchema.index({ name: 1, isInternCategory: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 