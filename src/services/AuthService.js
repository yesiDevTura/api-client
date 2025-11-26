const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * Auth Service Class
 * Handles authentication business logic
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data (name, email, password, role)
   * @returns {Promise<Object>} Created user and token
   */
  static async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        throw AppError.conflict('El email ya está registrado');
      }

      // Force CLIENT role for public registration (security)
      const userDataWithRole = {
        ...userData,
        role: 'CLIENT'
      };

      // Create user (password will be hashed by model hook)
      const user = await User.create(userDataWithRole);

      // Generate JWT token
      const token = AuthService.generateToken(user);

      logger.info(`Usuario registrado: ${user.email}`);

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      logger.error('Error en registro:', error);
      throw AppError.internal('Error al registrar usuario');
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and token
   */
  static async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw AppError.unauthorized('Credenciales inválidas');
      }

      // Check if user is active
      if (!user.isActive) {
        throw AppError.forbidden('Usuario inactivo');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw AppError.unauthorized('Credenciales inválidas');
      }

      // Generate JWT token
      const token = AuthService.generateToken(user);

      logger.info(`Usuario autenticado: ${user.email}`);

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      logger.error('Error en login:', error);
      throw AppError.internal('Error al iniciar sesión');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  static async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw AppError.notFound('Usuario');
      }

      return user.toJSON();
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      logger.error('Error al obtener usuario:', error);
      throw AppError.internal('Error al obtener usuario');
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Token expirado');
      }
      throw AppError.unauthorized('Token inválido');
    }
  }
}

module.exports = AuthService;