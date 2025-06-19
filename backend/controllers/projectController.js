const Project = require('../models/ProjectModel');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;

    if (!name || !description || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const startDate = new Date(); // Automatically use current date
    const endDate = new Date(deadline); // Parse from frontend

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      manager: req.user.id,
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all projects managed by the logged-in employee
// @route   GET /api/projects/manager
// @access  Private (employee only)
exports.getManagerProjects = async (req, res) => {
  try {
    const projects = await Project.find({ manager: req.user.id });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching manager projects:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/projects/available-employees
// @access  Private
exports.getAvailableEmployees = async (req, res) => {
  try {
    console.log('Fetching all employees...');
    
    // Get all employees
    const employees = await User.find({
      role: 'employee'
    })
    .select('-password')
    .populate('category', 'name description')
    .lean();

    console.log(`Successfully fetched ${employees.length} employees`);
    
    res.status(200).json({ 
      success: true, 
      employees: employees 
    });
  } catch (error) {
    console.error('Error in getAvailableEmployees:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Assign employees to a project
// @route   POST /api/projects/:id/assign
// @access  Private
exports.assignEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    console.log('Assigning employees:', { id, employeeIds });

    // Find the project and update it
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Filter out employees that are already assigned
    const newEmployeeIds = employeeIds.filter(id => !project.assignedEmployees.includes(id));
    
    if (newEmployeeIds.length === 0) {
      return res.status(200).json({ 
        success: false,
        message: 'Selected employee(s) are already assigned to this project' 
      });
    }

    // Add only new employees to the existing list
    project.assignedEmployees = [...project.assignedEmployees, ...newEmployeeIds];

    // Save the updated project
    await project.save();

    // Fetch the updated project with populated employee data
    const updatedProject = await Project.findById(id)
      .populate({
        path: 'manager',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'assignedEmployees',
        select: 'firstName lastName email category',
        populate: {
          path: 'category',
          select: 'name description'
        }
      });

    if (!updatedProject) {
      throw new Error('Failed to fetch updated project');
    }

    console.log('Updated project before transformation:', updatedProject);

    // Transform the data to match frontend expectations
    const transformedProject = {
      ...updatedProject.toObject(),
      deadline: updatedProject.endDate && !isNaN(new Date(updatedProject.endDate).getTime()) 
        ? updatedProject.endDate.toISOString() 
        : null,
      assignedEmployees: updatedProject.assignedEmployees.map(emp => {
        console.log('Employee data:', emp);
        return {
          employee: {
            _id: emp._id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            category: emp.category
          }
        };
      })
    };

    console.log('Transformed project:', transformedProject);

    res.status(200).json({
      success: true,
      project: transformedProject,
      message: newEmployeeIds.length < employeeIds.length 
        ? 'Some employees were already assigned to the project' 
        : 'All employees assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning employees:', error);
    res.status(500).json({ message: 'Error assigning employees', error: error.message });
  }
};

// @desc    Get a single project (by ID)
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    console.log('Fetching project with ID:', req.params.id);
    
    const project = await Project.findById(req.params.id)
      .populate('manager', 'firstName lastName email')
      .populate({
        path: 'assignedEmployees',
        select: 'firstName lastName email category',
        populate: {
          path: 'category',
          select: 'name description'
        }
      });

    if (!project) {
      console.log('Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('Project found:', project);

    // Transform the data to match frontend expectations
    const transformedProject = {
      ...project.toObject(),
      deadline: project.endDate && !isNaN(new Date(project.endDate).getTime()) 
        ? project.endDate.toISOString() 
        : null,
      assignedEmployees: project.assignedEmployees.map(emp => ({
        employee: emp
      }))
    };

    console.log('Transformed project:', transformedProject);

    // Send the response in the expected format
    return res.status(200).json({
      success: true,
      project: transformedProject
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating project status:', { projectId: req.params.id, newStatus: status });

    // Validate status value
    const validStatuses = ['pending', 'in-progress', 'completed', 'on-hold'];
    if (!validStatuses.includes(status)) {
      console.error('Invalid status value:', status);
      return res.status(400).json({ 
        message: 'Invalid status value', 
        validStatuses 
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      console.error('Project not found:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    await project.save();

    console.log('Project status updated successfully:', { 
      projectId: project._id, 
      newStatus: project.status 
    });

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Error updating project status:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get projects assigned to a specific employee
// @route   GET /api/projects/employee/assigned
// @access  Private
exports.getEmployeeProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      assignedEmployees: req.user.id
    });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching employee projects:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      manager: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.endDate = deadline ? new Date(deadline) : project.endDate;

    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      manager: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Remove an employee from a project
// @route   DELETE /api/projects/:id/employees/:employeeId
// @access  Private (Senior Project Manager only)
exports.removeEmployee = async (req, res) => {
  try {
    const { id, employeeId } = req.params;

    console.log('Removing employee:', { projectId: id, employeeId });

    // Find the project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove the employee from the project
    project.assignedEmployees = project.assignedEmployees.filter(
      empId => empId.toString() !== employeeId
    );

    // Save the updated project
    await project.save();

    // Fetch the updated project with populated employee data
    const updatedProject = await Project.findById(id)
      .populate({
        path: 'manager',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'assignedEmployees',
        select: 'firstName lastName email category',
        populate: {
          path: 'category',
          select: 'name description'
        }
      });

    if (!updatedProject) {
      throw new Error('Failed to fetch updated project');
    }

    // Transform the data to match frontend expectations
    const transformedProject = {
      ...updatedProject.toObject(),
      deadline: updatedProject.endDate && !isNaN(new Date(updatedProject.endDate).getTime()) 
        ? updatedProject.endDate.toISOString() 
        : null,
      assignedEmployees: updatedProject.assignedEmployees.map(emp => ({
        employee: {
          _id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          category: emp.category
        }
      }))
    };

    res.status(200).json({
      success: true,
      project: transformedProject,
      message: 'Employee removed from project successfully'
    });
  } catch (error) {
    console.error('Error removing employee:', error);
    res.status(500).json({ message: 'Error removing employee from project', error: error.message });
  }
};
