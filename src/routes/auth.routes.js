const express = require('express');
const AuthController = require('../controllers/AuthController');
const AuthValidator = require('../validators/AuthValidator');
const ValidationMiddleware = require('../middlewares/ValidationMiddleware');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

/**
 * @api {post} /api/auth/register Registrar nuevo usuario
 * @apiName Register
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiBody {String} name Nombre del usuario (mínimo 2 caracteres)
 * @apiBody {String} email Email del usuario
 * @apiBody {String} password Contraseña (mínimo 6 caracteres)
 * @apiBody {String="ADMIN","CLIENT"} [role=CLIENT] Rol del usuario
 *
 * @apiSuccess {Boolean} success Estado de la operación
 * @apiSuccess {String} message Mensaje de éxito
 * @apiSuccess {Object} data Datos del usuario creado
 * @apiSuccess {String} data.id ID del usuario
 * @apiSuccess {String} data.name Nombre del usuario
 * @apiSuccess {String} data.email Email del usuario
 * @apiSuccess {String} data.role Rol del usuario
 * @apiSuccess {String} data.token Token JWT de autenticación
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Usuario registrado exitosamente",
 *       "data": {
 *         "id": "uuid",
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "role": "CLIENT",
 *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       }
 *     }
 *
 * @apiError {Boolean} success=false Estado de la operación
 * @apiError {Object} error Detalles del error
 * @apiError {String} error.code Código del error
 * @apiError {String} error.message Mensaje de error
 *
 * @apiErrorExample {json} Email-Already-Exists:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "success": false,
 *       "error": {
 *         "code": "CONFLICT",
 *         "message": "El email ya existe en el sistema"
 *       }
 *     }
 */
router.post(
  '/register',
  ValidationMiddleware.validate(AuthValidator.register()),
  AuthController.register
);

/**
 * @api {post} /api/auth/login Iniciar sesión
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiBody {String} email Email del usuario
 * @apiBody {String} password Contraseña del usuario
 *
 * @apiSuccess {Boolean} success Estado de la operación
 * @apiSuccess {String} message Mensaje de éxito
 * @apiSuccess {Object} data Datos del usuario autenticado
 * @apiSuccess {String} data.id ID del usuario
 * @apiSuccess {String} data.name Nombre del usuario
 * @apiSuccess {String} data.email Email del usuario
 * @apiSuccess {String} data.role Rol del usuario
 * @apiSuccess {String} data.token Token JWT de autenticación
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Login exitoso",
 *       "data": {
 *         "id": "uuid",
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "role": "CLIENT",
 *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       }
 *     }
 *
 * @apiError UnauthorizedError Credenciales inválidas
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": {
 *         "code": "UNAUTHORIZED",
 *         "message": "Credenciales inválidas"
 *       }
 *     }
 */
router.post(
  '/login',
  ValidationMiddleware.validate(AuthValidator.login()),
  AuthController.login
);

/**
 * @api {get} /api/auth/me Obtener perfil del usuario actual
 * @api {get} /api/auth/me Get current user profile
 * @apiName GetProfile
 * @apiGroup Auth
 * @apiHeader {String} Authorization Bearer token
 * @apiSuccess {Object} data User profile data
 * @apiSuccess {String} message Success message
 */
router.get(
  '/me',
  AuthMiddleware.authenticate,
  AuthController.getProfile
);

module.exports = router;