import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Route not found on CitizenQueue API`));
};

/**
 * Global Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transform Mongoose CastError (bad ObjectId or parameter)
  if (err.name === 'CastError') {
    const message = `Invalid identifier format for resource: ${err.path}`;
    error = ApiError.badRequest(message);
  }

  // Transform Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    const message = `A record with this ${duplicateFields} already exists`;
    error = ApiError.conflict(message);
  }

  // Transform Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Database validation failed', errors);
  }

  // Transform JWT syntax / signature errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid security token provided');
  }

  // Transform JWT expiration
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Security token has expired, please re-authenticate');
  }

  // Fallback if not an instance of ApiError
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error occurred';
  const errors = error.errors || [];

  // Log 500-level errors for developer visibility (suppressed in test suites)
  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(`[SERVER_ERROR] [${req.method} ${req.originalUrl}]:`, err);
  }

  return ApiResponse.error(res, message, statusCode, errors);
};
