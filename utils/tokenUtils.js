import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_32_characters_long_min';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_32_characters_long_min';

/**
 * Generate short-lived access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    staffId: user.staffId,
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

/**
 * Generate secure signed refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    id: user?._id || user?.id || user,
    tokenType: 'refresh',
  };
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Hash refresh token before saving in database
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
