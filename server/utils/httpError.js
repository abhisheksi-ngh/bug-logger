// File: server/utils/httpError.js
class HttpError extends Error {
  constructor(statusCode, message, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'HttpError';
  }
}

module.exports = { HttpError };