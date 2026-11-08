/**
 * CitizenQueue - Unified API Client & Demo Adapter Interface
 * 
 * Provides an asynchronous contract matching production REST APIs.
 * When API_CONFIG.USE_BACKEND is false, it transparently routes requests to
 * the client-side storage adapter with simulated network delay.
 * When switched to true, it dispatches real HTTP fetch() requests to the backend.
 */

import { API_CONFIG } from '../../utils/constants';

/**
 * Standardized API response format
 * @param {any} data - Payload on success
 * @param {string|null} error - Error message on failure
 * @param {number} status - HTTP status code (200, 201, 400, 401, 404, 500)
 */
export function createApiResponse(data = null, error = null, status = 200) {
  return {
    success: !error && status >= 200 && status < 300,
    data,
    error,
    status,
    timestamp: new Date().toISOString()
  };
}

/**
 * Simulates network latency for demo interactions to provide realistic UI state (loaders, spinners)
 */
export const delay = (ms = API_CONFIG.SIMULATE_NETWORK_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Unified HTTP Request Dispatcher
 */
export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requiresAuth = true,
    localFallbackHandler = null
  } = options;

  // 1. If configured to use live backend, execute real fetch()
  if (API_CONFIG.USE_BACKEND) {
    try {
      const token = localStorage.getItem('cq_auth_token');
      const authHeaders = requiresAuth && token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const responseData = await response.json();
      if (!response.ok) {
        return createApiResponse(null, responseData.message || 'API request failed', response.status);
      }
      return createApiResponse(responseData.data ?? responseData, null, response.status);
    } catch (err) {
      return createApiResponse(null, err.message || 'Network connectivity error', 500);
    }
  }

  // 2. Demo Adapter: Simulate brief async delay and execute local fallback
  await delay();
  if (typeof localFallbackHandler === 'function') {
    try {
      const result = await localFallbackHandler();
      return createApiResponse(result, null, 200);
    } catch (err) {
      return createApiResponse(null, err.message || 'Local execution failed', 400);
    }
  }

  return createApiResponse(null, 'No local fallback handler specified for demo mode', 404);
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

