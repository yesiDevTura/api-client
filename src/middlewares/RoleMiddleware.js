const AppError = require('../utils/AppError');

/**
 * Role Middleware Class
 * Implements Role-Based Access Control (RBAC)
 */
class RoleMiddleware {
  /**
   * Check if user has required role(s)
   * @param {...string} roles - Allowed roles
   * @returns {Function} Express middleware
   */
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return next(AppError.unauthorized('Usuario no autenticado'));
      }

      if (!roles.includes(req.user.role)) {
        return next(
          AppError.forbidden(
            'No tienes permisos para acceder a este recurso'
          )
        );
      }

      next();
    };
  }

  /**
   * Check if user is admin
   * @returns {Function} Express middleware
   */
  static isAdmin() {
    return RoleMiddleware.authorize('ADMIN');
  }

  /**
   * Check if user is client
   * @returns {Function} Express middleware
   */
  static isClient() {
    return RoleMiddleware.authorize('CLIENT');
  }

  /**
   * Allow both admin and client
   * @returns {Function} Express middleware
   */
  static isAuthenticated() {
    return RoleMiddleware.authorize('ADMIN', 'CLIENT');
  }
}

module.exports = RoleMiddleware;