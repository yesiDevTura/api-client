const RoleMiddleware = require('../../../src/middlewares/RoleMiddleware');
const AppError = require('../../../src/utils/AppError');

describe('RoleMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authorize', () => {
    it('should allow access for user with correct role', () => {
      req.user = { id: 'user-id', email: 'admin@example.com', role: 'ADMIN' };
      const middleware = RoleMiddleware.authorize('ADMIN');
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for user with multiple allowed roles', () => {
      req.user = { id: 'user-id', email: 'client@example.com', role: 'CLIENT' };
      const middleware = RoleMiddleware.authorize('ADMIN', 'CLIENT');
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for user without correct role', () => {
      req.user = { id: 'user-id', email: 'client@example.com', role: 'CLIENT' };
      const middleware = RoleMiddleware.authorize('ADMIN');
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });

    it('should deny access if user is not authenticated', () => {
      req.user = null;
      const middleware = RoleMiddleware.authorize('ADMIN');
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('isAdmin', () => {
    it('should allow ADMIN users', () => {
      req.user = { role: 'ADMIN' };
      const middleware = RoleMiddleware.isAdmin;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny non-ADMIN users', () => {
      req.user = { role: 'CLIENT' };
      const middleware = RoleMiddleware.isAdmin;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('isClient', () => {
    it('should allow CLIENT users', () => {
      req.user = { role: 'CLIENT' };
      const middleware = RoleMiddleware.isClient;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny non-CLIENT users', () => {
      req.user = { role: 'ADMIN' };
      const middleware = RoleMiddleware.isClient;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('isAuthenticated', () => {
    it('should allow ADMIN users', () => {
      req.user = { role: 'ADMIN' };
      const middleware = RoleMiddleware.isAuthenticated;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow CLIENT users', () => {
      req.user = { role: 'CLIENT' };
      const middleware = RoleMiddleware.isAuthenticated;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny unauthenticated users', () => {
      req.user = null;
      const middleware = RoleMiddleware.isAuthenticated;
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});