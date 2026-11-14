import { ApiError } from '../utils/ApiError.js';

/**
 * Validates request body, query, or params against a Zod schema.
 * Replaces req[source] with the parsed (sanitized & coerced) data upon success.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source] || {};
      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(new ApiError(400, 'Validation failed', formattedErrors));
      }
      return next(err);
    }
  };
};

/**
 * Composite validator that can validate body, query, and params in one call
 * @param {{ body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schemas
 */
export const validateAll = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params || {});
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query || {});
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body || {});
      }
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(new ApiError(400, 'Validation failed', formattedErrors));
      }
      return next(err);
    }
  };
};
