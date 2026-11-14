import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { User } from '../models/User.js';

/**
 * Authenticate incoming HTTP request via Bearer JWT or Cookie
 */
export const authenticate = async (req, res, next) => {
  let token = null;

  // 1. Check Authorization Header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.cq_access_token) {
    // 2. Check HttpOnly cookie
    token = req.cookies.cq_access_token;
  }

  if (!token) {
    return next(ApiError.unauthorized('Authentication token is missing. Please sign in.'));
  }

  try {
    const decoded = verifyAccessToken(token);

    // Fetch user from DB to verify active account status
    const user = await User.findById(decoded.id).select('+accountStatus');
    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    if (user.accountStatus === 'suspended') {
      return next(ApiError.forbidden('Your account has been suspended. Please contact institutional support.'));
    }

    if (user.accountStatus === 'pending_verification') {
      return next(ApiError.forbidden('Your account is pending verification.'));
    }

    // Attach authenticated user identity to request
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      school: user.school,
      schoolId: user.schoolId,
      staffId: user.staffId,
      designation: user.designation,
      department: user.department
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token has expired. Please refresh your session.', [{ code: 'TOKEN_EXPIRED' }]));
    }
    return next(ApiError.unauthorized('Invalid authentication token.'));
  }
};

/**
 * Optional authentication: attaches user if token is present, does not reject if missing
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.cq_access_token;
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.accountStatus === 'active') {
      req.user = {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId
      };
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};
