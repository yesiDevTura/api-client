const AuthController = require('../../../src/controllers/AuthController');
const AuthService = require('../../../src/services/AuthService');
const ApiResponse = require('../../../src/utils/ApiResponse');

// Mock dependencies
jest.mock('../../../src/services/AuthService');
jest.mock('../../../src/utils/ApiResponse');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'CLIENT',
      };

      const mockResult = {
        user: {
          id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CLIENT',
        },
        token: 'mock-token',
      };

      AuthService.register.mockResolvedValue(mockResult);

      const mockResponse = {
        send: jest.fn(),
      };
      ApiResponse.created.mockReturnValue(mockResponse);

      // Act
      await AuthController.register(req, res, next);

      // Assert
      expect(AuthService.register).toHaveBeenCalledWith(req.body);
      expect(ApiResponse.created).toHaveBeenCalledWith(
        mockResult,
        'Usuario registrado exitosamente'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(res);
    });

    it('should handle registration errors', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Registration failed');
      AuthService.register.mockRejectedValue(error);

      // Act
      try {
        await AuthController.register(req, res, next);
      } catch (e) {
        // catchAsync will handle the error
      }

      // Assert
      expect(AuthService.register).toHaveBeenCalledWith(req.body);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'CLIENT',
        },
        token: 'mock-token',
      };

      AuthService.login.mockResolvedValue(mockResult);

      const mockResponse = {
        send: jest.fn(),
      };
      ApiResponse.success.mockReturnValue(mockResponse);

      // Act
      await AuthController.login(req, res, next);

      // Assert
      expect(AuthService.login).toHaveBeenCalledWith(
        req.body.email,
        req.body.password
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResult,
        'Inicio de sesión exitoso'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(res);
    });

    it('should handle login errors', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      AuthService.login.mockRejectedValue(error);

      // Act
      try {
        await AuthController.login(req, res, next);
      } catch (e) {
        // catchAsync will handle the error
      }

      // Assert
      expect(AuthService.login).toHaveBeenCalledWith(
        req.body.email,
        req.body.password
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      // Arrange
      req.user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      AuthService.getUserById.mockResolvedValue(mockUser);

      const mockResponse = {
        send: jest.fn(),
      };
      ApiResponse.success.mockReturnValue(mockResponse);

      // Act
      await AuthController.getProfile(req, res, next);

      // Assert
      expect(AuthService.getUserById).toHaveBeenCalledWith(req.user.id);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockUser,
        'Perfil obtenido exitosamente'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(res);
    });

    it('should handle profile retrieval errors', async () => {
      // Arrange
      req.user = {
        id: 'invalid-id',
      };

      const error = new Error('User not found');
      AuthService.getUserById.mockRejectedValue(error);

      // Act
      try {
        await AuthController.getProfile(req, res, next);
      } catch (e) {
        // catchAsync will handle the error
      }

      // Assert
      expect(AuthService.getUserById).toHaveBeenCalledWith(req.user.id);
    });
  });
});