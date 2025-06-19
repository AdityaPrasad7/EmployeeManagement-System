const Task = require('../models/TaskModel');
const Project = require('../models/ProjectModel');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Senior Project Manager only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedToId, dueDate } = req.body;

    // Validate required fields
    if (!title || !description || !projectId || !assignedToId || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if project exists and user is assigned to it
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the assigned employee is part of the project
    if (!project.assignedEmployees.includes(assignedToId)) {
      return res.status(400).json({ message: 'Selected employee is not assigned to this project' });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedToId,
      assignedBy: req.user.id,
      dueDate: new Date(dueDate)
    });

    // Populate the task with user details
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email');

    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.query;

    // Find the project to check if user is the manager
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project manager
    const isManager = project.manager.toString() === req.user.id;

    // Build query
    let query = { project: projectId };
    
    // If not manager, only show tasks assigned to the user
    if (!isManager) {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get tasks assigned to the logged-in user
// @route   GET /api/tasks/assigned
// @access  Private
exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'name description')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the project to check if user is the manager
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is either the assigned employee or the project manager
    const isAssignedEmployee = task.assignedTo.toString() === req.user.id;
    const isProjectManager = project.manager.toString() === req.user.id;

    if (!isAssignedEmployee && !isProjectManager) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email');

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Senior Project Manager only)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is the task creator
    if (task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}; 