// const jwt = require('jsonwebtoken');

//    const auth = (req, res, next) => {
//      const token = req.header('x-auth-token');
//      if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

//      try {
//        const decoded = jwt.verify(token, process.env.JWT_SECRET);
//        req.user = decoded;
//        next();
//      } catch (error) {
//        res.status(401).json({ msg: 'Token is not valid' });
//      }
//    };

//    module.exports = auth;
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const { HttpError } = require('../utils/httpError');

/**
 * Middleware to authenticate requests using JWT.
 * Verifies the 'x-auth-token' header and attaches decoded user data to req.user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const auth = (req, res, next) => {
  // Validate JWT_SECRET environment variable
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET environment variable is not defined');
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error',
      errorCode: 'SERVER_CONFIG_ERROR',
    });
  }

  // Extract and sanitize token from header
  const token = req.header('x-auth-token')?.trim();
  if (!token) {
    logger.warn('Authentication attempt without token');
    return res.status(401).json({
      status: 'error',
      message: 'No token provided, authorization denied',
      errorCode: 'NO_TOKEN',
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate decoded payload
    if (!decoded.id || !decoded.role) {
      logger.warn(`Invalid token payload structure: ${JSON.stringify(decoded)}`);
      throw new HttpError(401, 'Invalid token payload', 'INVALID_PAYLOAD');
    }

    // Attach user data to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    logger.info(`User authenticated successfully: ${decoded.id}`);
    next();
  } catch (error) {
    // Handle specific JWT errors
    let errorMessage = 'Token is not valid';
    let errorCode = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Malformed or invalid token';
      errorCode = 'MALFORMED_TOKEN';
    }

    logger.error(`Authentication failed: ${error.message}`, {
      errorCode,
      token: token.substring(0, 10) + '...', // Log partial token for safety
    });

    return res.status(401).json({
      status: 'error',
      message: errorMessage,
      errorCode,
    });
  }
};

module.exports = auth;