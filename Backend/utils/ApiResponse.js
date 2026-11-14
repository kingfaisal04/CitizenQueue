/**
 * Unified API Response Formatter
 * Matches the client-side contract expected by CitizenQueue frontend:
 * { success: Boolean, data: Object|Array|null, error: String|null, status: Number, timestamp: ISOString }
 */
export class ApiResponse {
  constructor(statusCode, data = null, message = null) {
    this.status = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.data = data;
    this.error = this.success ? null : (message || 'Request failed');
    this.timestamp = new Date().toISOString();
  }

  static success(res, data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, null));
  }

  static created(res, data = null) {
    return res.status(201).json(new ApiResponse(201, data, null));
  }

  static error(res, message, statusCode = 400, errors = []) {
    const response = new ApiResponse(statusCode, errors.length > 0 ? { details: errors } : null, message);
    return res.status(statusCode).json(response);
  }
}
