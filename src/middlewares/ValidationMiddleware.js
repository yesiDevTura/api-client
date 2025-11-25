const AppError = require('../utils/AppError');

/**
 * Validation Middleware Class
 * Validates request data against Joi schemas
 */
class ValidationMiddleware {
  /**
   * Validate request body
   * @param {Object} schema - Joi schema
   * @returns {Function} Express middleware
   */
  static validate(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return next(AppError.validationError('Error de validación', details));
      }

      req.body = value;
      next();
    };
  }
}

module.exports = ValidationMiddleware;