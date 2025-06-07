const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator'); // Added for email validation
const { logger } = require('../utils/logger');
const { HttpError } = require('../utils/httpError');
const User = require('../models/User');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with JWT token
 */
const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Validate input
    if (!email || !password || !role) {
      throw new HttpError(400, 'All fields are required', 'MISSING_FIELDS');
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      throw new HttpError(400, 'Invalid email format', 'INVALID_EMAIL');
    }
    // Alternative Regex Validation:
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   throw new HttpError(400, 'Invalid email format', 'INVALID_EMAIL');
    // }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      throw new HttpError(400, 'User already exists', 'USER_EXISTS');
    }

    // Create new user
    user = new User({ email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Generate JWT
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ status: 'success', data: { token } });
  } catch (error) {
    logger.error(`Registration failed for ${email}: ${error.message}`);
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
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with JWT token
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required', 'MISSING_FIELDS');
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      throw new HttpError(400, 'Invalid email format', 'INVALID_EMAIL');
    }
    // Alternative Regex Validation:
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   throw new HttpError(400, 'Invalid email format', 'INVALID_EMAIL');
    // }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpError(400, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpError(400, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate JWT
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({ status: 'success', data: { token } });
  } catch (error) {
    logger.error(`Login failed for ${email}: ${error.message}`);
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
 * Get authenticated user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }

    logger.info(`User profile fetched: ${user.email}`);
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    logger.error(`Profile fetch failed for user ${req.user.id}: ${error.message}`);
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

module.exports = { registerUser, loginUser, getUserProfile };