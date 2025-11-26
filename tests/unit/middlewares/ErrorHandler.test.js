const ErrorHandler = require('../../../src/middlewares/ErrorHandler');
const AppError = require('../../../src/utils/AppError');

// Mock logger
jest.mock('../../../src/config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

const logger = require('../../../src/config/logger');

describe('ErrorHandler', () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      originalUrl: '/api/test',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('handleSequelizeValidationError', () => {
    it('should handle Sequelize validation error', () => {
      const err = {
        name: 'SequelizeValidationError',
        errors: [
          { path: 'email', message: 'Email is required' },
          { path: 'password', message: 'Password is too short' },
        ],
      };

      const result = ErrorHandler.handleSequelizeValidationError(err);

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(422);
      expect(result.details).toHaveLength(2);
    });
  });

  describe('handleSequelizeUniqueConstraintError', () => {
    it('should handle unique constraint error', () => {
      const err = {
        name: 'SequelizeUniqueConstraintError',
        errors: [{ path: 'email' }],
      };

      const result = ErrorHandler.handleSequelizeUniqueConstraintError(err);

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(409);
      expect(result.message).toContain('email');
    });
  });

  describe('handleJWTError', () => {
    it('should handle invalid JWT token', () => {
      const result = ErrorHandler.handleJWTError();

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(401);
      expect(result.message).toContain('Token inválido');
    });
  });

  describe('handleJWTExpiredError', () => {
    it('should handle expired JWT token', () => {
      const result = ErrorHandler.handleJWTExpiredError();

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(401);
      expect(result.message).toContain('Token expirado');
    });
  });

  describe('handle', () => {
    it('should handle AppError in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = AppError.badRequest('Invalid input');

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Invalid input',
            statusCode: 400,
          }),
        })
      );
    });

    it('should handle operational error in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = AppError.notFound('Resource');

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Resource no encontrado',
            statusCode: 404,
          }),
        })
      );
    });

    it('should handle non-operational error in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Database connection failed');

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Algo salió mal en el servidor',
            statusCode: 500,
          }),
        })
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should transform SequelizeValidationError', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        name: 'SequelizeValidationError',
        errors: [{ path: 'email', message: 'Invalid email' }],
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should transform SequelizeUniqueConstraintError', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        name: 'SequelizeUniqueConstraintError',
        errors: [{ path: 'email' }],
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should transform JsonWebTokenError', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should transform TokenExpiredError', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('notFound', () => {
    it('should create 404 error for non-existent route', () => {
      ErrorHandler.notFound(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('/api/test'),
        })
      );
    });
  });

  describe('catchAsync', () => {
    it('should catch async errors and pass to next', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFn = ErrorHandler.catchAsync(asyncFn);

      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with no args on success', async () => {
      const asyncFn = jest.fn().mockResolvedValue();
      const wrappedFn = ErrorHandler.catchAsync(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalled();
    });
  });
});
