import { ApiError } from '../utils/ApiError.js';

/**
 * Enforce role authorization
 * @param  {...string} allowedRoles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Treat 'citizen' and 'student' as equivalent student personas
    const userRole = req.user.role;
    const normalizedUserRole = userRole === 'citizen' ? 'student' : userRole;
    const normalizedAllowed = allowedRoles.map((r) => (r === 'citizen' ? 'student' : r));

    if (normalizedAllowed.includes(normalizedUserRole) || normalizedAllowed.includes(userRole)) {
      return next();
    }

    return next(
      ApiError.forbidden(
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${userRole}`
      )
    );
  };
};

/**
 * Convenience guards
 */
export const requireStudent = requireRole('student', 'citizen');

export const requireAdmin = requireRole(
  'admin',
  'school_admin',
  'super_admin',
  'academic_officer',
  'housemaster',
  'registrar',
  'finance_officer',
  'library_officer',
  'collection_officer'
);

export const requireSchoolManager = requireRole('admin', 'school_admin', 'super_admin');

export const requireFinanceOfficer = requireRole('admin', 'school_admin', 'super_admin', 'finance_officer');

export const requireLibraryOfficer = requireRole('admin', 'school_admin', 'super_admin', 'library_officer');

export const requireAcademicOfficer = requireRole('admin', 'school_admin', 'super_admin', 'academic_officer', 'registrar');

export const requireCollectionOfficer = requireRole('admin', 'school_admin', 'super_admin', 'collection_officer', 'registrar');
