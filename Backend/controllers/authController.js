import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Cookie options for secure JWT storage
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registerStudent = asyncHandler(async (req, res) => {
  const result = await AuthService.registerStudent(
    req.body,
    req.ip,
    req.headers['user-agent']
  );

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);
  return ApiResponse.created(res, {
    user: result.user,
    student: result.student,
    admission: result.admission,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const result = await AuthService.registerAdmin(
    req.body,
    req.ip,
    req.headers['user-agent']
  );

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);
  return ApiResponse.created(res, {
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await AuthService.login(
    identifier,
    password,
    req.ip,
    req.headers['user-agent']
  );

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);
  return ApiResponse.success(res, {
    user: result.user,
    student: result.student,
    admission: result.admission,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await AuthService.refreshTokens(
    token,
    req.ip,
    req.headers['user-agent']
  );

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  return ApiResponse.success(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (req.user) {
    await AuthService.logout(req.user._id, token);
  }
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  return ApiResponse.success(res, { message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await AuthService.getMe(req.user._id);
  return ApiResponse.success(res, result);
});
