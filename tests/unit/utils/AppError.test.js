const AppError = require('../../../src/utils/AppError');

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR', { field: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should create error without details', () => {
      const error = new AppError('Test error', 404, 'NOT_FOUND');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.details).toBeNull();
    });
  });

  describe('badRequest', () => {
    it('should create 400 error', () => {
      const error = AppError.badRequest('Invalid data');
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid data');
    });
  });

  describe('unauthorized', () => {
    it('should create 401 error', () => {
      const error = AppError.unauthorized('Not authenticated');
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Not authenticated');
    });
  });

  describe('forbidden', () => {
    it('should create 403 error', () => {
      const error = AppError.forbidden('No access');
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('No access');
    });
  });

  describe('notFound', () => {
    it('should create 404 error', () => {
      const error = AppError.notFound('User');
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User no encontrado');
    });
  });

  describe('conflict', () => {
    it('should create 409 error', () => {
      const error = AppError.conflict('Email exists');
      
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Email exists');
    });
  });

  describe('validationError', () => {
    it('should create 422 error with details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = AppError.validationError('Validation failed', details);
      
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
    });
  });

  describe('internal', () => {
    it('should create 500 error', () => {
      const error = AppError.internal('Server error');
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Server error');
    });
  });
});