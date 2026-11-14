/**
 * Standardized Operational API Error
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg, errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Authentication required') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Access forbidden: Insufficient permissions or institutional boundary violated') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Requested resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource conflict or concurrent state mismatch') {
    return new ApiError(409, msg);
  }

  static internal(msg = 'Internal server error occurred') {
    return new ApiError(500, msg);
  }
}
