/**
 * Custom Application Error Class
 * Extends the native Error class to provide structured error handling
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code for client identification
   * @param {*} details - Additional error details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'No autorizado', details = null) {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message = 'Acceso prohibido', details = null) {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  static notFound(resource = 'Recurso', details = null) {
    return new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND', details);
  }

  static conflict(message, details = null) {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static validationError(message = 'Error de validación', details = null) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  static internal(message = 'Error interno del servidor', details = null) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

module.exports = AppError;