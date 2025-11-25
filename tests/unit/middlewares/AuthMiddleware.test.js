const AuthMiddleware = require('../../../src/middlewares/AuthMiddleware');
const AuthService = require('../../../src/services/AuthService');
const { User } = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');

// Mock dependencies
jest.mock('../../../src/services/AuthService');
jest.mock('../../../src/models');

describe('AuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';

      const decodedToken = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        name: 'Test User',
        isActive: true,
      };

      AuthService.verifyToken.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(AuthService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(User.findByPk).toHaveBeenCalledWith('user-id');
      expect(req.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw error if no authorization header', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Token no proporcionado');
    });

    it('should throw error if authorization header does not start with Bearer', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat token';

      // Act
      await AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Token no proporcionado');
    });

    it('should throw error if token is invalid', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      AuthService.verifyToken.mockImplementation(() => {
        throw AppError.unauthorized('Token inválido');
      });

      // Act
      await AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(AuthService.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should throw error if user not found', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';

      const decodedToken = {
        id: 'non-existent-user',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      AuthService.verifyToken.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(null);

      // Act
      await AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('non-existent-user');
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Usuario no encontrado');
    });

    it('should throw error if user is inactive', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';

      const decodedToken = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        name: 'Test User',
        isActive: false,
      };

      AuthService.verifyToken.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith('user-id');
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Usuario inactivo');
    });
  });
});