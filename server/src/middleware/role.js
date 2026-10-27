import ApiError from '../utils/ApiError.js';

/**
 * Role-based authorization middleware.
 * Usage: role('admin', 'staff')
 */
const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
};

export default role;
