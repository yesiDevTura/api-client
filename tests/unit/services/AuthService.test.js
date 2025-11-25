const jwt = require('jsonwebtoken');
const AuthService = require('../../../src/services/AuthService');
const { User } = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');

// Mock dependencies
jest.mock('../../../src/models');
jest.mock('jsonwebtoken');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'CLIENT',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      User.findOne = jest.fn().mockResolvedValue(null);
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT',
        toJSON: jest.fn().mockReturnValue({
          id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CLIENT',
        }),
      };
      User.create = jest.fn().mockResolvedValue(mockUser);
      jwt.sign = jest.fn().mockReturnValue('mock-token');

      // Act
      const result = await AuthService.register(userData);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('mock-token');
    });

    it('should throw conflict error if email already exists', async () => {
      // Arrange
      User.findOne = jest.fn().mockResolvedValue({ email: userData.email });

      // Act & Assert
      await expect(AuthService.register(userData)).rejects.toThrow('El email ya está registrado');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(AuthService.register(userData)).rejects.toThrow('Error al registrar usuario');
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 'user-id',
          email: 'test@example.com',
          role: 'CLIENT',
        }),
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      jwt.sign = jest.fn().mockReturnValue('mock-token');

      // Act
      const result = await AuthService.login(email, password);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should throw unauthorized error if user not found', async () => {
      // Arrange
      User.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw forbidden error if user is inactive', async () => {
      // Arrange
      const mockUser = {
        email: 'test@example.com',
        isActive: false,
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Usuario inactivo');
    });

    it('should throw unauthorized error if password is invalid', async () => {
      // Arrange
      const mockUser = {
        email: 'test@example.com',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('getUserById', () => {
    it('should return user data if user exists', async () => {
      // Arrange
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        toJSON: jest.fn().mockReturnValue({ id: userId, email: 'test@example.com' }),
      };
      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.getUserById(userId);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ id: userId, email: 'test@example.com' });
    });

    it('should throw not found error if user does not exist', async () => {
      // Arrange
      User.findByPk = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.getUserById('invalid-id')).rejects.toThrow('Usuario');
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      // Arrange
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      };
      jwt.sign = jest.fn().mockReturnValue('mock-token');
      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRES_IN = '24h';

      // Act
      const token = AuthService.generateToken(user);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email, role: user.role },
        'test-secret',
        { expiresIn: '24h' }
      );
      expect(token).toBe('mock-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', () => {
      // Arrange
      const token = 'valid-token';
      const decoded = { id: 'user-id', email: 'test@example.com' };
      jwt.verify = jest.fn().mockReturnValue(decoded);
      process.env.JWT_SECRET = 'test-secret';

      // Act
      const result = AuthService.verifyToken(token);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toEqual(decoded);
    });

    it('should throw unauthorized error for expired token', () => {
      // Arrange
      const token = 'expired-token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(token)).toThrow('Token expirado');
    });

    it('should throw unauthorized error for invalid token', () => {
      // Arrange
      const token = 'invalid-token';
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(token)).toThrow('Token inválido');
    });
  });
});