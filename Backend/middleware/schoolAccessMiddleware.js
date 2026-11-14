import { ApiError } from '../utils/ApiError.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * Enforce multi-institution data isolation
 * Guarantees that administrative users cannot read or mutate data outside their assigned school.
 */
export const enforceSchoolAccess = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  // System Super-Admin bypass (if configured)
  if (req.user.role === 'super_admin') {
    return next();
  }

  const userSchoolId = req.user.schoolId;

  if (!userSchoolId) {
    return next(ApiError.forbidden('User has no assigned institution boundary. Access denied.'));
  }

  // Inspect incoming parameters for explicit target school IDs
  const targetSchoolId =
    req.params.schoolId ||
    req.params.institutionId ||
    req.query.schoolId ||
    req.query.institutionId ||
    req.body?.schoolId ||
    req.body?.institutionId;

  // If a target school was explicitly passed in the request, it MUST match the user's authorized school
  if (targetSchoolId && targetSchoolId !== userSchoolId) {
    // Log security breach attempt asynchronously
    AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      schoolId: userSchoolId,
      action: 'CROSS_SCHOOL_ACCESS_VIOLATION',
      entityType: 'InstitutionBoundary',
      entityId: targetSchoolId,
      status: 'BLOCKED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: {
        attemptedSchoolId: targetSchoolId,
        authorizedSchoolId: userSchoolId,
        path: req.originalUrl,
        method: req.method
      }
    }).catch((err) => console.error('[Audit Error] Failed to log cross-school violation:', err));

    return next(
      ApiError.forbidden(
        `Cross-institution access violation: You are not authorized to access or modify records for institution "${targetSchoolId}".`
      )
    );
  }

  // Bind authoritative school context to request so controllers don't need to re-verify
  req.schoolId = userSchoolId;

  // Helper method to automatically construct institution-scoped Mongoose filters
  req.scopedFilter = (filter = {}) => ({
    ...filter,
    schoolId: userSchoolId
  });

  next();
};
