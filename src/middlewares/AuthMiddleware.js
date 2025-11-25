const AuthService = require('../services/AuthService');
const AppError = require('../utils/AppError');
const { User } = require('../models');

/**
 * Auth Middleware Class
 * Verifies JWT tokens and authenticates users
 */
class AuthMiddleware {
  /**
   * Authenticate user with JWT token
   * @returns {Function} Express middleware
   */
  static authenticate = async (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw AppError.unauthorized('Token no proporcionado');
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const decoded = AuthService.verifyToken(token);

      // Get user from database
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw AppError.unauthorized('Usuario no encontrado');
      }

      if (!user.isActive) {
        throw AppError.forbidden('Usuario inactivo');
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthMiddleware;