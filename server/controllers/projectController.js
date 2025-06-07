// File: server/controllers/projectController.js
const { logger } = require('../utils/logger');
const { HttpError } = require('../utils/httpError');
const Project = require('../models/Project');

/**
 * Create a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created project
 */
const createProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Validate input
    if (!name || !description) {
      throw new HttpError(400, 'Name and description are required', 'MISSING_FIELDS');
    }

    // Create project
    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
    });
    await project.save();

    logger.info(`Project created by user ${req.user.id}: ${name}`);
    res.status(201).json({ status: 'success', data: project });
  } catch (error) {
    logger.error(`Project creation failed: ${error.message}`);
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        errorCode: error.errorCode,
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      errorCode: 'SERVER_ERROR',
    });
  }
};

/**
 * Get all projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with list of projects
 */
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'email');
    logger.info(`Projects fetched by user ${req.user.id}`);
    res.status(200).json({ status: 'success', data: projects });
  } catch (error) {
    logger.error(`Projects fetch failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      errorCode: 'SERVER_ERROR',
    });
  }
};

/**
 * Update a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated project
 */
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      throw new HttpError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    // Check if user is authorized
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      throw new HttpError(403, 'Not authorized to update this project', 'UNAUTHORIZED');
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    await project.save();

    logger.info(`Project updated by user ${req.user.id}: ${project.name}`);
    res.status(200).json({ status: 'success', data: project });
  } catch (error) {
    logger.error(`Project update failed: ${error.message}`);
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        errorCode: error.errorCode,
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      errorCode: 'SERVER_ERROR',
    });
  }
};

/**
 * Delete a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming deletion
 */
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      throw new HttpError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    // Check if user is authorized
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      throw new HttpError(403, 'Not authorized to delete this project', 'UNAUTHORIZED');
    }

    await project.remove();
    logger.info(`Project deleted by user ${req.user.id}: ${project.name}`);
    res.status(200).json({ status: 'success', message: 'Project deleted' });
  } catch (error) {
    logger.error(`Project deletion failed: ${error.message}`);
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        errorCode: error.errorCode,
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      errorCode: 'SERVER_ERROR',
    });
  }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };