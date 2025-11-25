const AppError = require('../utils/AppError');
const logger = require('../config/logger');

class ErrorHandler {
  static handleSequelizeValidationError(err) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return AppError.validationError('Error de validación de datos', errors);
  }

  static handleSequelizeUniqueConstraintError(err) {
    const field = err.errors[0]?.path || 'campo';
    return AppError.conflict(`El ${field} ya existe en el sistema`);
  }

  static handleSequelizeForeignKeyConstraintError(err) {
    return AppError.badRequest('Referencia inválida en la base de datos');
  }

  static handleJWTError() {
    return AppError.unauthorized('Token inválido');
  }

  static handleJWTExpiredError() {
    return AppError.unauthorized('Token expirado');
  }

  static sendErrorDevelopment(err, res) {
    logger.error('Error en desarrollo:', {
      status: err.statusCode,
      message: err.message,
      stack: err.stack,
      error: err,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
        details: err.details,
      },
    });
  }

  static sendErrorProduction(err, res) {
    if (err.isOperational) {
      logger.error('Error operacional:', {
        status: err.statusCode,
        message: err.message,
      });

      res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          statusCode: err.statusCode,
          ...(err.details && { details: err.details }),
        },
      });
    } else {
      logger.error('Error no operacional:', {
        message: err.message,
        stack: err.stack,
        error: err,
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Algo salió mal en el servidor',
          statusCode: 500,
        },
      });
    }
  }

  static handle(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.code = err.code || 'INTERNAL_ERROR';

    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    if (err.name === 'SequelizeValidationError') {
      error = ErrorHandler.handleSequelizeValidationError(err);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      error = ErrorHandler.handleSequelizeUniqueConstraintError(err);
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      error = ErrorHandler.handleSequelizeForeignKeyConstraintError(err);
    }

    if (err.name === 'JsonWebTokenError') {
      error = ErrorHandler.handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
      error = ErrorHandler.handleJWTExpiredError();
    }

    if (process.env.NODE_ENV === 'development') {
      ErrorHandler.sendErrorDevelopment(error, res);
    } else {
      ErrorHandler.sendErrorProduction(error, res);
    }
  }

  static notFound(req, res, next) {
    const error = AppError.notFound(`Ruta ${req.originalUrl}`);
    next(error);
  }

  static catchAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;