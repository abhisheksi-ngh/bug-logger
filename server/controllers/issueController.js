// File: server/controllers/issueController.js
const { logger } = require('../utils/logger');
const { HttpError } = require('../utils/httpError');
const Issue = require('../models/Issue');

/**
 * Create a new issue
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created issue
 */
const createIssue = async (req, res) => {
  const { title, description, projectId, assignedTo } = req.body;

  try {
    // Validate input
    if (!title || !description || !projectId) {
      throw new HttpError(400, 'Title, description, and projectId are required', 'MISSING_FIELDS');
    }

    // Create issue
    const issue = new Issue({
      title,
      description,
      projectId,
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
    });
    await issue.save();

    logger.info(`Issue created by user ${req.user.id}: ${title}`);
    res.status(201).json({ status: 'success', data: issue });
  } catch (error) {
    logger.error(`Issue creation failed: ${error.message}`);
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
 * Get all issues for a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with list of issues
 */
const getIssues = async (req, res) => {
  const { projectId } = req.params;

  try {
    const issues = await Issue.find({ projectId })
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email');
    logger.info(`Issues fetched for project ${projectId} by user ${req.user.id}`);
    res.status(200).json({ status: 'success', data: issues });
  } catch (error) {
    logger.error(`Issues fetch failed: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      errorCode: 'SERVER_ERROR',
    });
  }
};

/**
 * Update an issue
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated issue
 */
const updateIssue = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assignedTo } = req.body;

  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      throw new HttpError(404, 'Issue not found', 'ISSUE_NOT_FOUND');
    }

    // Check authorization
    if (issue.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      throw new HttpError(403, 'Not authorized to update this issue', 'UNAUTHORIZED');
    }

    // Update fields
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;
    if (assignedTo) issue.assignedTo = assignedTo;
    await issue.save();

    logger.info(`Issue updated by user ${req.user.id}: ${issue.title}`);
    res.status(200).json({ status: 'success', data: issue });
  } catch (error) {
    logger.error(`Issue update failed: ${error.message}`);
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
 * Delete an issue
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming deletion
 */
const deleteIssue = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      throw new HttpError(404, 'Issue not found', 'ISSUE_NOT_FOUND');
    }

    // Check authorization
    if (issue.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      throw new HttpError(403, 'Not authorized to delete this issue', 'UNAUTHORIZED');
    }

    await issue.remove();
    logger.info(`Issue deleted by user ${req.user.id}: ${issue.title}`);
    res.status(200).json({ status: 'success', message: 'Issue deleted' });
  } catch (error) {
    logger.error(`Issue deletion failed: ${error.message}`);
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

module.exports = { createIssue, getIssues, updateIssue, deleteIssue };