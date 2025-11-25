const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');
const ErrorHandler = require('../middlewares/ErrorHandler');

/**
 * Auth Controller Class
 * Handles HTTP requests for authentication
 */
class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  static register = ErrorHandler.catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    const result = await AuthService.register({ name, email, password, role });

    const response = ApiResponse.created(
      result,
      'Usuario registrado exitosamente'
    );

    response.send(res);
  });

  /**
   * Login user
   * @route POST /api/auth/login
   */
  static login = ErrorHandler.catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    const response = ApiResponse.success(
      result,
      'Inicio de sesión exitoso'
    );

    response.send(res);
  });

  /**
   * Get current authenticated user profile
   * @route GET /api/auth/me
   */
  static getProfile = ErrorHandler.catchAsync(async (req, res) => {
    const user = await AuthService.getUserById(req.user.id);

    const response = ApiResponse.success(
      user,
      'Perfil obtenido exitosamente'
    );

    response.send(res);
  });
}

module.exports = AuthController;