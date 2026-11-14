/**
 * Wrapper for Express async route handlers to automatically pass errors to next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
