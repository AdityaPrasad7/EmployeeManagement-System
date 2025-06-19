const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  // Permanent Categories
  {
    name: 'Senior Project Manager',
    description: 'Project management and team leadership roles',
    isInternCategory: false
  },
  {
    name: 'Senior Developer',
    description: 'Software development and programming roles',
    isInternCategory: false
  },
  {
    name: 'Senior Tester',
    description: 'Quality assurance and testing roles',
    isInternCategory: false
  },
  {
    name: 'Business Analyst',
    description: 'Business and administrative roles',
    isInternCategory: false
  },
  // Intern Categories
  {
    name: 'Project Coordinator',
    description: 'Project management intern position',
    isInternCategory: true
  },
  {
    name: 'Junior Developer',
    description: 'Software development intern position',
    isInternCategory: true
  },
  {
    name: 'QA Trainee',
    description: 'Testing intern position',
    isInternCategory: true
  },
  {
    name: 'Business Trainee',
    description: 'Business intern position',
    isInternCategory: true
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create all categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Created categories:', createdCategories.map(c => ({ id: c._id, name: c.name })));

    console.log('✅ Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories(); 