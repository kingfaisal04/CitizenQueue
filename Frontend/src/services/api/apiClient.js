/**
 * CitizenQueue - Centralized Production API Client
 * 
 * Provides unified HTTP request dispatching, automatic JWT header injection,
 * HttpOnly cookie credential forwarding, 401 token refresh retry,
 * standardized operational error mapping, and timeout protection.
 */

import { API_CONFIG } from '../../utils/constants';

let inMemoryToken = null;
let isRefreshing = null;

export const setClientToken = (token) => {
  inMemoryToken = token;
  try {
    if (token) {
      sessionStorage.setItem('cq_access_token', token);
    } else {
      sessionStorage.removeItem('cq_access_token');
    }
  } catch (e) {
    // SessionStorage may be restricted in private browsing
  }
};

export const getClientToken = () => {
  if (inMemoryToken) return inMemoryToken;
  try {
    return sessionStorage.getItem('cq_access_token');
  } catch {
    return null;
  }
};

/**
 * Standardized API response structure matching backend envelope
 */
export function createApiResponse(data = null, error = null, status = 200) {
  return {
    success: !error && status >= 200 && status < 300,
    data,
    error: error ? String(error) : null,
    status,
    timestamp: new Date().toISOString()
  };
}

/**
 * Unified HTTP Request Dispatcher
 */
export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requiresAuth = true,
    timeoutMs = API_CONFIG.TIMEOUT_MS || 15000,
    _isRetry = false
  } = options;

  const baseUrl = (API_CONFIG.BASE_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  // AbortController for network timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = getClientToken();
    const authHeaders = requiresAuth && token ? { Authorization: `Bearer ${token}` } : {};

    const isFormData = body instanceof FormData;
    const requestHeaders = {
      ...authHeaders,
      ...headers
    };

    if (!isFormData && body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Include HttpOnly cookies for refresh token exchange
      signal: controller.signal,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    };

    const response = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId);

    // 401 Unauthorized handling & automatic token refresh
    if (response.status === 401 && requiresAuth && !_isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      try {
        if (!isRefreshing) {
          isRefreshing = fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }).then((res) => (res.ok ? res.json() : null));
        }

        const refreshResult = await isRefreshing;
        isRefreshing = null;

        if (refreshResult && refreshResult.data && refreshResult.data.accessToken) {
          setClientToken(refreshResult.data.accessToken);
          // Replay original request with refreshed token
          return await request(endpoint, { ...options, _isRetry: true });
        }
      } catch (refreshErr) {
        isRefreshing = null;
      }

      // If refresh failed, clear session and notify
      setClientToken(null);
      window.dispatchEvent(new CustomEvent('cq:session_expired'));
      return createApiResponse(null, 'Session expired. Please log in again.', 401);
    }

    // Parse response
    let responseData = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      const detailMessages = Array.isArray(responseData?.data?.details)
        ? responseData.data.details
            .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
            .filter(Boolean)
            .join(' • ')
        : '';

      const errorMessage =
        detailMessages ||
        responseData?.error ||
        responseData?.message ||
        'Request failed';

      return createApiResponse(null, errorMessage, response.status);
    }

    // Backend returns { success, data, error, status }
    const unwrappedData = responseData?.data !== undefined ? responseData.data : responseData;
    return createApiResponse(unwrappedData, null, response.status);
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return createApiResponse(null, 'Request timed out. Please check your network connection.', 408);
    }

    const isNetworkError =
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('Load failed') ||
      err.message?.includes('NetworkError');

    return createApiResponse(
      null,
      isNetworkError
        ? 'Cannot connect to CitizenQueue API server. Please check your connection or ensure backend is running.'
        : err.message || 'Network connectivity error',
      500
    );
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;
