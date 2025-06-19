const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
require('dotenv').config();

const updateEmployeeCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    console.log('Found categories:', categories.map(c => ({ id: c._id, name: c.name })));

    // Get all employees
    const employees = await User.find({ role: 'employee' });
    console.log(`Found ${employees.length} employees`);

    // Update each employee's category based on their position
    for (const employee of employees) {
      console.log(`\nProcessing employee: ${employee.firstName} ${employee.lastName}`);
      console.log(`Current position: ${employee.position}`);
      console.log(`Current category: ${employee.category}`);
      
      let matchingCategory;
      
      // Special case for Senior Project Manager
      if (employee.position === 'Senior Project Manager') {
        matchingCategory = categories.find(cat => cat.name === 'Senior Project Manager');
        console.log('Found matching category for Senior Project Manager:', matchingCategory);
      } else {
        matchingCategory = categories.find(cat => cat.name === employee.position);
      }

      if (matchingCategory) {
        employee.category = matchingCategory._id;
        await employee.save();
        console.log(`Updated ${employee.firstName} ${employee.lastName}'s category to ${matchingCategory.name}`);
      } else {
        console.log(`No matching category found for ${employee.firstName} ${employee.lastName}'s position: ${employee.position}`);
      }
    }

    console.log('\n✅ Employee categories updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating employee categories:', error);
    process.exit(1);
  }
};

updateEmployeeCategories(); 