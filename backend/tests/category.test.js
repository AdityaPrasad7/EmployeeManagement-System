const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Category = require('../models/Category');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let hrToken;
let hrUser;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-management-test');

  // Create HR user for testing
  hrUser = await User.create({
    email: 'hr@test.com',
    password: 'Test123!',
    role: 'hr',
    firstName: 'HR',
    lastName: 'Test',
    department: 'HR',
    position: 'HR Manager',
    category: new mongoose.Types.ObjectId() // Temporary category ID
  });

  // Generate token for HR user
  hrToken = jwt.sign(
    { id: hrUser._id, role: hrUser.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({});
  await Category.deleteMany({});
  await mongoose.connection.close();
});

describe('Category API Tests', () => {
  let testCategoryId;

  test('GET /api/categories - Get all categories', async () => {
    const response = await request(app)
      .get('/api/categories')
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('GET /api/categories/main - Get main categories', async () => {
    const response = await request(app)
      .get('/api/categories/main')
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach(category => {
      expect(category.isInternCategory).toBeFalsy();
    });
  });

  test('GET /api/categories/intern - Get intern categories', async () => {
    const response = await request(app)
      .get('/api/categories/intern')
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach(category => {
      expect(category.isInternCategory).toBeTruthy();
    });
  });

  test('POST /api/categories - Create new category (HR only)', async () => {
    const newCategory = {
      name: 'Test Category',
      description: 'Test Description',
      isInternCategory: false
    };

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${hrToken}`)
      .send(newCategory)
      .expect(201);

    expect(response.body.name).toBe(newCategory.name);
    testCategoryId = response.body._id;
  });

  test('PUT /api/categories/:id - Update category (HR only)', async () => {
    const updateData = {
      name: 'Updated Category',
      description: 'Updated Description'
    };

    const response = await request(app)
      .put(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.name).toBe(updateData.name);
  });

  test('DELETE /api/categories/:id - Delete category (HR only)', async () => {
    await request(app)
      .delete(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .expect(200);
  });

  // Test unauthorized access
  test('POST /api/categories - Unauthorized access', async () => {
    const newCategory = {
      name: 'Unauthorized Category',
      description: 'Test Description',
      isInternCategory: false
    };

    await request(app)
      .post('/api/categories')
      .send(newCategory)
      .expect(401);
  });
}); 